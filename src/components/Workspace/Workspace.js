import React, { useState, useEffect } from "react";
import axios from "axios";
import Split from "react-split";
import { useParams, useNavigate } from "react-router-dom";
import ProblemDescription from "./ProblemDescription";
import CodeEditor from "./CodeEditor";

// Language Selector Component
const LanguageSelector = ({ selectedLanguageId, setSelectedLanguageId, languages }) => (
  <div className="language-selector">
    <label htmlFor="language">Select Language:</label>
    <select
      id="language"
      value={selectedLanguageId}
      onChange={(e) => setSelectedLanguageId(Number(e.target.value))}
    >
      {languages.map((lang) => (
        <option key={lang.id} value={lang.id}>
          {lang.name}
        </option>
      ))}
    </select>
  </div>
);

// Output Preview Component
const OutputPreview = ({ output, compileStatus }) => (
  <div className="output-preview">
    <h3>Output Preview</h3>
    {compileStatus.status && (
      <div className="compile-status">
        <p><strong>Status:</strong> {compileStatus.status}</p>
        {compileStatus.time && <p><strong>Execution Time:</strong> {compileStatus.time}</p>}
        {compileStatus.memory && <p><strong>Memory Used:</strong> {compileStatus.memory}</p>}
      </div>
    )}
    <pre>{output}</pre>
  </div>
);

// Button Container Component
const ButtonContainer = ({ handleCompile, checkSubmissionStatus, isSubmitting, isCheckingStatus, submissionId, code }) => (
  <div className="button-container">
    <button 
      className="compile-button" 
      onClick={handleCompile} 
      disabled={isSubmitting || !code}
    >
      {isSubmitting ? "Compiling..." : "Compile"}
    </button>
    {submissionId && (
      <button 
        className="check-status-button" 
        onClick={checkSubmissionStatus}
        disabled={isCheckingStatus}
      >
        {isCheckingStatus ? "Checking..." : "Check Status"}
      </button>
    )}
  </div>
);

function Workspace() {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [output, setOutput] = useState("");
  const [submissionId, setSubmissionId] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [selectedLanguageId, setSelectedLanguageId] = useState(92); // Default to Python
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [compileStatus, setCompileStatus] = useState({
    status: null,
    message: "",
    time: null,
    memory: null
  });

  const token = localStorage.getItem("token");

  // Fetch problem details
  useEffect(() => {
    if (!problemId) return;

    const fetchProblemDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/problems/${problemId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDetails(response.data);
      } catch (error) {
        console.error("Error fetching problem details:", error);
        setError("Error fetching problem details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProblemDetails();
  }, [problemId, token]);

  // Fetch programming languages
  const fetchLanguages = async () => {
    const options = {
      method: "GET",
      url: "https://judge0-ce.p.rapidapi.com/languages",
      headers: {
        "x-rapidapi-key": "8fd792c414msha5b799f22d55532p13345ejsnbc9d95444943",
        "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
      },
    };

    try {
      const response = await axios.request(options);
      const filteredLanguages = response.data.filter(lang =>
        ["C", "C++", "JavaScript", "Java", "Python", "Dart"].some(name =>
          lang.name.includes(name)
        )
      );
      setLanguages(filteredLanguages);
    } catch (error) {
      console.error("Error fetching languages:", error);
      alert("Error fetching programming languages.");
    }
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  // Handle compile action
  const handleCompile = async () => {
    setIsSubmitting(true);
    setOutput("");
    setSubmissionId(null);
    setCompileStatus({
      status: null,
      message: "",
      time: null,
      memory: null
    });

    if (!code.trim()) {
      alert("Please provide valid source code.");
      setIsSubmitting(false);
      return;
    }

    const base64Code = btoa(unescape(encodeURIComponent(code)));

    const formData = {
      language_id: selectedLanguageId,
      source_code: base64Code,
      stdin: "",
    };

    const options = {
      method: "POST",
      url: "https://judge0-ce.p.rapidapi.com/submissions",
      params: { fields: "*" },
      headers: {
        "x-rapidapi-key": "8fd792c414msha5b799f22d55532p13345ejsnbc9d95444943",
        "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
        "Content-Type": "application/json",
      },
      data: formData,
    };

    try {
      const response = await axios.request(options);
      const { token } = response.data;
      setSubmissionId(token);

      await checkSubmissionStatus(token);
    } catch (error) {
      console.error("Compilation error:", error);
      alert(`Compilation failed: ${error.response?.data?.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check submission status
  const checkSubmissionStatus = async (submissionToken = submissionId) => {
    if (!submissionToken) return;

    setIsCheckingStatus(true);

    const options = {
      method: "GET",
      url: `https://judge0-ce.p.rapidapi.com/submissions/${submissionToken}`,
      params: {
        base64_encoded: "true",
        fields: "*",
      },
      headers: {
        "x-rapidapi-key": "8fd792c414msha5b799f22d55532p13345ejsnbc9d95444943",
        "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
      },
    };

    try {
      const response = await axios.request(options);
      const { stdout, stderr, compile_output, status, time, memory } = response.data;

      const decodedOutput = stdout 
        ? atob(stdout) 
        : (stderr 
          ? atob(stderr) 
          : (compile_output 
            ? atob(compile_output) 
            : "No output generated"));

      setCompileStatus({
        status: status.description,
        message: decodedOutput,
        time: time ? `${time} seconds` : null,
        memory: memory ? `${memory} KB` : null
      });

      setOutput(decodedOutput);

      if (status.id <= 2) {
        setTimeout(() => checkSubmissionStatus(submissionToken), 1000);
      }
    } catch (error) {
      console.error("Error checking submission status:", error);
      alert("Error checking submission status.");
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Mark problem as solved
  const markProblemAsSolved = async () => {
    const token = localStorage.getItem("token");
    
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/problems/${problemId}/solve`,
        {}, // No body needed
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data.success) {
        alert(`Problem marked as solved! Earned ${response.data.pointsAwarded} points.`);
        navigate("/problemtable");
      }
    } catch (error) {
      console.error("Error marking problem as solved:", error);
      alert(error.response?.data?.message || "Failed to mark the problem as solved.");
    }
  };
  
  
  
  

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!details) return <div>Problem not found</div>;

  return (
    <Split className="split-horizontal" direction="horizontal" sizes={[50, 50]} gutterSize={10}>
      <div className="workspace-panel">
        <ProblemDescription details={details} />
      </div>
      <div className="workspace-panel">
        <LanguageSelector
          selectedLanguageId={selectedLanguageId}
          setSelectedLanguageId={setSelectedLanguageId}
          languages={languages}
        />
        <CodeEditor code={code} setCode={setCode} />
        <OutputPreview output={output} compileStatus={compileStatus} />
        <ButtonContainer
          handleCompile={handleCompile}
          checkSubmissionStatus={checkSubmissionStatus}
          isSubmitting={isSubmitting}
          isCheckingStatus={isCheckingStatus}
          submissionId={submissionId}
          code={code}
        />
        <button onClick={markProblemAsSolved}>Mark as Solved</button>
      </div>
    </Split>
  );
}

export default Workspace;
