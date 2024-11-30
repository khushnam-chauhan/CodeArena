import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Rankings.css"; // Make sure you have styles

const Rankings = () => {
  const [users, setUsers] = useState([]);  // State to hold ranking data
  const [filteredUsers, setFilteredUsers] = useState([]);  // State for filtered users based on search
  const [loading, setLoading] = useState(true);  // State for loading
  const [error, setError] = useState(null);  // State for error handling
  const [searchTerm, setSearchTerm] = useState('');  // State for search term

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRankingData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/rankings");  // Endpoint for rankings
        if (!response.ok) {
          throw new Error("Failed to fetch ranking data");
        }
        const data = await response.json();
        setUsers(data);  // Set the fetched users' data
        setFilteredUsers(data);  // Initially set filtered users to all users
        setLoading(false);  // Stop loading
      } catch (err) {
        setError(err.message);  // Set error message if fetching fails
        setLoading(false);
      }
    };

    fetchRankingData();
  }, []);

  useEffect(() => {
    // Filter users based on the search term
    setFilteredUsers(
      users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, users]);

  if (loading) {
    return <div className="loading-message">Loading rankings...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="ranking-page">
      <div className="ranking-header">
        <h1>Rankings</h1>
        <p>See where you stand among other users!</p>
        
        {/* Search Bar */}
        <input
          type="text"
          className="search-input"
          placeholder="Search by Username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="ranking-table">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th>Institute</th>
              <th>Course</th>
              <th>Points</th>
              <th>Tier</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers
              .sort((a, b) => b.points - a.points) // Sort users by points in descending order
              .map((user, index) => {
                let rowClass = ""; // Default class for normal rows
                if (index === 0) rowClass = "top-rank"; // Top performer (1st)
                if (index === 1) rowClass = "second-rank"; // Second performer (2nd)
                if (index === 2) rowClass = "third-rank"; // Third performer (3rd)

                return (
                  <tr key={user.username} className={rowClass}>
                    <td>{index + 1}</td>
                    <td>
                      {user.username}
                      {/* Add trophies for the top 3 users */}
                      {index === 0 && <span className="trophy">🏆</span>}
                      {index === 1 && <span className="trophy">🥈</span>}
                      {index === 2 && <span className="trophy">🥉</span>}
                    </td>
                    <td>{user.institute}</td>
                    <td>{user.course}</td>
                    <td>{user.points}</td>
                    <td>{user.tier}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Rankings;
