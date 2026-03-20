import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';

const TeacherDashboard = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/teacher/dashboard')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.log(err));
  }, []);

  return (
  <View style={{ padding: 20, backgroundColor: '#F8F6F2', flex: 1 }}>
    
    <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
      Teacher Dashboard
    </Text>

    {data ? (
      <View style={{ gap: 15 }}>

        {/* Students Card */}
        <View style={{
          padding: 20,
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          elevation: 3
        }}>
          <Text>Total Students</Text>
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
            {data.totalStudents}
          </Text>
        </View>

        {/* Classes Card */}
        <View style={{
          padding: 20,
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          elevation: 3
        }}>
          <Text>Total Classes</Text>
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
            {data.totalClasses}
          </Text>
        </View>

        {/* Notifications Card */}
        <View style={{
          padding: 20,
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          elevation: 3
        }}>
          <Text>Notifications</Text>
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
            {data.notifications}
          </Text>
        </View>

      </View>
    ) : (
      <Text>Loading...</Text>
    )}

  </View>
); 
};
        


export default TeacherDashboard;