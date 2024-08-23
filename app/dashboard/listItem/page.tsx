'use client';

import React, { useEffect, useState } from 'react';
import MoveItems from '@/components/forms/MoveItems';
import axios from 'axios';
import PageContainer from '@/components/layout/page-container';
import { useSession } from 'next-auth/react';
type Permission = {
  id: string;
  name: string;
};
const Home = () => {
  const { data: session, status } = useSession();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [user, setUser] = useState({ permissions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
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
            (p: { permission_code: string; permission_name: string }) => ({
              id: p.permission_code,
              name: p.permission_name
            })
          );

          setPermissions(permissions);
        } catch (error) {
          console.error('Failed to fetch permissions:', error);
        }
      };

      const fetchUserPermissions = async () => {
        try {
          const response = await axios.get(
            `/api/users/permission/${session.user.id}`
          );
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
    }
  }, [status, session]);
  const handleSubmit = async (data: any) => {
    try {
      await axios.put('/api/roles/user-permissions', {
        userId: session.user.id,
        created_by: session.user.id,
        data: data
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
            <h1>Permmission: {user.employment_name}</h1>
            <MoveItems
              userPermissions={user.user_permissions}
              userRoles={user.roles}
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
