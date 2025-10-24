import { useEffect, useState } from "react";
import Highcharts from "highcharts";

export default function Dashboard() {
  const [serverData, setServerData] = useState({
    current: 0,
    peak: 0,
    average: 0,
    history: []
  });

  useEffect(() => {
    const wsUrl = "ws://http://147.135.252.68:20050//"; // đổi thành WS server của bạn
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const requests = Number(data.requests);
      const time = new Date().getTime();

      setServerData(prev => {
        const history = [...prev.history, requests].slice(-60);
        const peak = Math.max(...history);
        const average = Math.round(history.reduce((a, b) => a + b, 0) / history.length);
        return { current: requests, peak, average, history };
      });

      // Update chart
      if (window.chart) {
        window.chart.series[0].addPoint([time, requests], true, window.chart.series[0].points.length > 60);
      }
    };

    // Create chart after mount
    const chart = Highcharts.chart("chart", {
      chart: { type: "area" },
      title: { text: "Layer7 DSTAT" },
      xAxis: { type: "datetime" },
      yAxis: { title: { text: "" } },
      series: [{ name: "Requests", data: [] }],
      exporting: { enabled: true }
    });

    window.chart = chart;

    return () => ws.close();
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h2>
        <span
          style={{
            display: "inline-block",
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#4CAF50",
            marginRight: 6
          }}
        ></span>
        Capturing requests from server1.example.com
      </h2>
      <div style={{ display: "flex", gap: 15, marginTop: 20 }}>
        <div style={{ padding: 15, background: "#fff", borderRadius: 6, textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 5 }}>Current</div>
          <div style={{ fontSize: 24, fontWeight: "bold", color: "#333" }}>{serverData.current}</div>
        </div>
        <div style={{ padding: 15, background: "#fff", borderRadius: 6, textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 5 }}>Peak</div>
          <div style={{ fontSize: 24, fontWeight: "bold", color: "#333" }}>{serverData.peak}</div>
        </div>
        <div style={{ padding: 15, background: "#fff", borderRadius: 6, textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 5 }}>Average</div>
          <div style={{ fontSize: 24, fontWeight: "bold", color: "#333" }}>{serverData.average}</div>
        </div>
      </div>
      <div id="chart" style={{ width: "85%", height: 300, margin: "30px auto" }}></div>
    </div>
  );
}
