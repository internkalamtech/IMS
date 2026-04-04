import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';

const TeacherDashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/teacher/dashboard')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.log(err));
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20 }}>Teacher Dashboard</Text>

      {data ? (
        <>
          <Text>Total Students: {data.totalStudents}</Text>
          <Text>Total Classes: {data.totalClasses}</Text>
          <Text>Notifications: {data.notifications}</Text>
        </>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
};

export default TeacherDashboard;