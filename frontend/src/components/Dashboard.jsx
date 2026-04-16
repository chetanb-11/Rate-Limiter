import React from 'react'

const Dashboard = ({ stats }) => {
  return (
    <div>
      <h2>Dashboard</h2>
      {stats && stats.length > 0 ? (
        <ul>
          {stats.map((stat, index) => (
            <li key={index}>
              {stat.ip} - {stat.route}: {stat.requests} requests (Time left: {stat.ttl}s)
            </li>
          ))}
        </ul>
      ) : (
        <p>No stats available yet. Click the button to load.</p>
      )}
    </div>
  )
}

export default Dashboard