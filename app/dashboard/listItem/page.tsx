'use client';

import React, { useEffect, useState } from 'react';
import MoveItems from '@/components/forms/MoveItems';
import axios from 'axios';
import PageContainer from '@/components/layout/page-container';
type Permission = {
  id: string;
  name: string;
};
const Home = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [user, setUser] = useState({ permissions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get('/api/roles/list-roles');
        setRoles(response.data);
      } catch (error) {
        console.error('Failed to fetch roles:', error);
      }
    };

    const fetchPermissions = async () => {
      try {
        const response = await axios.get('/api/roles/permissions');
        const permissions: Permission[] = response.data.map(
          (p: { id: string; name: string }) => ({
            id: p.id,
            name: p.name
          })
        );

        setPermissions(permissions);
      } catch (error) {
        console.error('Failed to fetch permissions:', error);
      }
    };

    const fetchUserPermissions = async () => {
      try {
        const response = await axios.get('/api/users/permission/1');
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user permissions:', error);
      }
    };

    const fetchData = async () => {
      await Promise.all([
        fetchRoles(),
        fetchPermissions(),
        fetchUserPermissions()
      ]);
      setLoading(false);
    };

    fetchData();
  }, []);
  const handleSubmit = async (data: any) => {
    try {
      await axios.put('/api/roles/user-permissions', {
        userId: 1,
        permissionIds: data.finalOptions
      });
    } catch (error) {
      console.error('Error updating permissions:', error);
    }
  };
  return (
    <PageContainer scrollable={true}>
      <div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {/* <pre>{JSON.stringify(user.permissions, null, 2)}</pre>
            <pre>{JSON.stringify(permissions, null, 2)}</pre> */}
            <h1>Permmission: {user.name}</h1>
            <MoveItems
              userPermissions={user.permissions}
              allPermissions={permissions}
              allRoles={roles}
              onSubmit={handleSubmit}
            />
          </>
        )}
      </div>
    </PageContainer>
  );
};

export default Home;
