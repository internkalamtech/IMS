import React, { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/transport/dashboard")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error(err));
  }, []);

  if (!data) return <h2 style={{ textAlign: "center" }}>Loading...</h2>;

  return (
    <div style={{ padding: "30px", textAlign: "center" }}>
      <h1>🚍 Transport Dashboard</h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "20px",
        marginTop: "30px"
      }}>

        <div style={cardStyle}>
          <h2>Total Buses</h2>
          <p>{data.total_buses}</p>
        </div>

        <div style={cardStyle}>
          <h2>Active Drivers</h2>
          <p>{data.active_drivers}</p>
        </div>

        <div style={cardStyle}>
          <h2>Routes</h2>
          <p>{data.routes}</p>
        </div>

        <div style={cardStyle}>
          <h2>Students</h2>
          <p>{data.students_using_transport}</p>
        </div>

      </div>
    </div>
  );
}

const cardStyle = {
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 0 10px rgba(0,0,0,0.2)",
  backgroundColor: "#f9f9f9"
};

export default App;