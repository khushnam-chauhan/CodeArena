import React from "react";

const TestCases = ({ 
  handleCompile, 
  testcases = [], 
  processing 
}) => {
  return (
    <div className="testcase-container">
      <div className="test-cases">
        <div className="test-cases-heading">Test Cases</div>
        {testcases.map((testcase, idx) => (
          <div key={idx} className="testcase">
            <div className="test-case-number">Case {idx + 1}</div>
            <div className="testcases-input-container">
              <p>Input:</p>
              <div className="testcase-input">{testcase.input}</div>
            </div>
            <div className="testcases-output-container">
              <p>Expected Output:</p>
              <div className="testcase-output">{testcase.output}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="compile-btn-container">
        <button 
          onClick={handleCompile} 
          disabled={processing}
        >
          {processing ? "Processing..." : "Compile and Execute"}
        </button>
      </div>
    </div>
  );
};

export default TestCases;