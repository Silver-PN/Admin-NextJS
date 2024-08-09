'use client';
import {
  Button,
  Container,
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Role {
  id: number;
  name: string;
}

interface Permission {
  id: number;
  name: string;
}

interface RolePermission {
  id: number;
  role: Role;
  permission: Permission;
}

const RolePermissionsPage = () => {
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<number | null>(
    null
  );

  useEffect(() => {
    const fetchRolePermissions = async () => {
      try {
        const response = await axios.get('/api/roles/role-permissions');
        setRolePermissions(response.data);
      } catch (error) {
        console.error('Failed to fetch role permissions:', error);
      }
    };

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
        setPermissions(response.data);
      } catch (error) {
        console.error('Failed to fetch permissions:', error);
      }
    };

    fetchRolePermissions();
    fetchRoles();
    fetchPermissions();
  }, []);

  const handleAddRolePermission = async () => {
    if (selectedRole === null || selectedPermission === null) return;
    try {
      const response = await axios.post('/api/role-permissions', {
        roleId: selectedRole,
        permissionId: selectedPermission
      });
      setRolePermissions([...rolePermissions, response.data]);
    } catch (error) {
      console.error('Failed to add role permission:', error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Role Permissions
      </Typography>
      <Paper style={{ padding: 16 }}>
        {rolePermissions.length > 0 ? (
          <Grid container spacing={2}>
            {rolePermissions.map((rolePermission) => (
              <Grid
                item
                xs={12}
                key={`${rolePermission.id}-${rolePermission.role?.id}-${rolePermission.permission.id}`}
              >
                <Paper style={{ padding: 16 }}>
                  <Typography variant="body1">
                    Role: {rolePermission.role?.name} - Permission:{' '}
                    {rolePermission.permission?.name}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body1">
            No role permissions available.
          </Typography>
        )}
      </Paper>
      <Paper style={{ padding: 16, marginTop: 16 }}>
        <FormControl fullWidth margin="normal">
          <InputLabel id="role-select-label">Select Role</InputLabel>
          <Select
            labelId="role-select-label"
            value={selectedRole ?? ''}
            onChange={(e) => setSelectedRole(Number(e.target.value))}
          >
            <MenuItem value="">Select Role</MenuItem>
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel id="permission-select-label">
            Select Permission
          </InputLabel>
          <Select
            labelId="permission-select-label"
            value={selectedPermission ?? ''}
            onChange={(e) => setSelectedPermission(Number(e.target.value))}
          >
            <MenuItem value="">Select Permission</MenuItem>
            {permissions.map((permission) => (
              <MenuItem key={permission.id} value={permission.id}>
                {permission.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddRolePermission}
          style={{ marginTop: 16 }}
        >
          Add Role Permission
        </Button>
      </Paper>
    </Container>
  );
};

export default RolePermissionsPage;
