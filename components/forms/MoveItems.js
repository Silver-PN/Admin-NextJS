import React, { useState, useEffect } from 'react';
import {
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  ThemeProvider,
  createTheme,
  Box,
  InputAdornment,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import { useTheme } from 'next-themes';
const darkTheme = createTheme({
  palette: {
    mode: 'dark'
  }
});

const lightTheme = createTheme({
  palette: {
    mode: 'light'
  }
});
const MoveItems = ({
  userPermissions = [],
  userRoles = [],
  allPermissions = [],
  allRoles = [],
  onSubmit
}) => {
  const [leftOptions, setLeftOptions] = useState([]);
  const [rightOptions1, setRightOptions1] = useState([]);
  const [rightOptions2, setRightOptions2] = useState([]);
  const [tmpRightOptions1, setTmpRightOptions1] = useState([]);
  const [finalOptions, setFinalOptions] = useState([]);
  const [initialLeftOptions, setInitialLeftOptions] = useState([]);
  const [initialRightOptions1, setInitialRightOptions1] = useState([]);
  const [initialRightOptions2, setInitialRightOptions2] = useState([]);
  const [initialLFinalOptions, setInitialLFinalOptions] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(new Set());
  const [selectedRight1, setSelectedRight1] = useState(new Set());
  const [selectedRight2, setSelectedRight2] = useState(new Set());
  const [selectedFinal, setSelectedFinal] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchQueryFinal, setSearchQueryFinal] = useState('');
  const [selectedRoles, setSelectedRoles] = useState(() => {
    const initialRoles = new Set();
    userRoles
      .filter((role) => role != null)
      .forEach((role) => {
        if (role.id != null) {
          initialRoles.add(role.id);
        }
      });
    return initialRoles;
  });

  const { theme } = useTheme();

  const sortByName = (options) => {
    return options.sort((a, b) => a.label.localeCompare(b.label));
  };

  useEffect(() => {
    const allOptions = (allPermissions || []).map((permission) => ({
      value: permission.id,
      label: permission.name
    }));

    const deny = (userPermissions || [])
      .filter((up) => up.has_permission_type === 'lock')
      .map((up) => {
        const permission = allPermissions.find(
          (p) => p.id === up.permission_code
        );
        return {
          value: up.permission_code,
          label: permission ? permission.name : '',
          role_code: up.role_code
        };
      });

    const allow = (userPermissions || [])
      .filter((up) => up.has_permission_type === 'add')
      .map((up) => {
        const permission = allPermissions.find(
          (p) => p.id === up.permission_code
        );
        return {
          value: up.permission_code,
          label: permission ? permission.name : '',
          role_code: up.role_code
        };
      });

    // const allOptionsSet = new Set(allOptions.map((option) => option.value));
    const allowSet = new Set(allow.map((option) => option.value));
    const denySet = new Set(deny.map((option) => option.value));

    const filteredAllOptions = allOptions.filter(
      (option) => !allowSet.has(option.value) && !denySet.has(option.value)
    );

    // Update state with sorted options
    setLeftOptions(sortByName(filteredAllOptions));
    setRightOptions1(sortByName(allow));
    setRightOptions2(sortByName(deny));

    setInitialLeftOptions(sortByName(filteredAllOptions));
    setInitialRightOptions1(sortByName(allow));
    setInitialRightOptions2(sortByName(deny));
  }, [userPermissions, allPermissions]);

  useEffect(() => {
    let combinedOptions;

    if (selectedRoles.size !== 0) {
      const selectedRoleIds = Array.from(selectedRoles);
      const filteredRoles = allRoles.filter((role) =>
        selectedRoleIds.includes(role.id)
      );

      const allPermissionsSelect = filteredRoles
        .flatMap((role) =>
          role.permissions.map((perm) => ({
            value: perm,
            role_code: role.role_code
          }))
        )
        .filter(
          (value, index, self) =>
            index === self.findIndex((t) => t.value === value.value)
        );

      const allPermissionsInRole = allPermissions.filter((permission) =>
        allPermissionsSelect.some((item) => item.value === permission.id)
      );

      const transformedPermissions = allPermissionsInRole.map((permission) => {
        const roleCode = allPermissionsSelect.find(
          (item) => item.value === permission.id
        )?.role_code;
        return {
          value: permission.id,
          label: permission.name,
          role_code: roleCode
        };
      });
      const existingOptions = rightOptions1.filter((option) =>
        transformedPermissions.some(
          (permission) => permission.value === option.value
        )
      );
      setTmpRightOptions1(existingOptions);
      combinedOptions = [
        ...initialLFinalOptions,
        ...rightOptions1,
        ...transformedPermissions
      ];
    } else {
      setTmpRightOptions1([]);
      combinedOptions = [...initialLFinalOptions, ...rightOptions1];
    }

    const optionsMap = new Map();

    combinedOptions.forEach((option) => {
      if (!optionsMap.has(option.value) || option.role_code) {
        optionsMap.set(option.value, option);
      }
    });

    const uniqueOptions = Array.from(optionsMap.values());
    const updatedFinalOptions = uniqueOptions.filter(
      (option) =>
        !rightOptions2.some(
          (right2Option) => right2Option.value === option.value
        )
    );

    setFinalOptions(sortByName(updatedFinalOptions));
  }, [
    allPermissions,
    allRoles,
    initialLFinalOptions,
    rightOptions1,
    rightOptions2,
    selectedRoles,
    userRoles
  ]);
  // useEffect(() => {
  //   if (tmpRightOptions1.length > 0) {
  //     const updatedRightOptions1 = rightOptions1.filter(
  //       (option) =>
  //         !tmpRightOptions1.some((existing) => existing.value === option.value)
  //     );
  //     setRightOptions1(updatedRightOptions1);
  //   }
  // }, [rightOptions1, tmpRightOptions1]);
  const filterLeftOptions = () => {
    return leftOptions.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };
  const filterFinalOptions = () => {
    return finalOptions.filter((option) =>
      option.label.toLowerCase().includes(searchQueryFinal.toLowerCase())
    );
  };

  const handleRowClick = (value, setSelected) => {
    setSelected((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return newSet;
    });
  };

  const moveRight1 = () => {
    if (selectedLeft.size > 0) {
      const optionsToMove = leftOptions.filter((option) =>
        selectedLeft.has(option.value)
      );
      setRightOptions1(sortByName([...rightOptions1, ...optionsToMove]));
      setLeftOptions(
        leftOptions.filter((option) => !selectedLeft.has(option.value))
      );
      setSelectedLeft(new Set());
    }
  };

  const moveRight2 = () => {
    if (selectedLeft.size > 0) {
      const optionsToMove = leftOptions.filter((option) =>
        selectedLeft.has(option.value)
      );
      setRightOptions2(sortByName([...rightOptions2, ...optionsToMove]));
      setLeftOptions(
        leftOptions.filter((option) => !selectedLeft.has(option.value))
      );
      setSelectedLeft(new Set());
    }
  };

  const moveLeft1 = () => {
    if (selectedRight1.size > 0) {
      const optionsToMove = rightOptions1.filter((option) =>
        selectedRight1.has(option.value)
      );
      setLeftOptions(sortByName([...leftOptions, ...optionsToMove]));
      setRightOptions1(
        rightOptions1.filter((option) => !selectedRight1.has(option.value))
      );
      setSelectedRight1(new Set());
    }
  };

  const moveLeft2 = () => {
    if (selectedRight2.size > 0) {
      const optionsToMove = rightOptions2.filter((option) =>
        selectedRight2.has(option.value)
      );
      setLeftOptions(sortByName([...leftOptions, ...optionsToMove]));
      setRightOptions2(
        rightOptions2.filter((option) => !selectedRight2.has(option.value))
      );
      setSelectedRight2(new Set());
    }
  };

  const moveAllRight1 = () => {
    setRightOptions1(sortByName([...rightOptions1, ...leftOptions]));
    setLeftOptions([]);
    setSelectedLeft(new Set());
  };

  const moveAllRight2 = () => {
    setRightOptions2(sortByName([...rightOptions2, ...leftOptions]));
    setLeftOptions([]);
    setSelectedLeft(new Set());
  };

  const moveAllLeft1 = () => {
    setLeftOptions(sortByName([...leftOptions, ...rightOptions1]));
    setRightOptions1([]);
    setSelectedRight1(new Set());
  };

  const moveAllLeft2 = () => {
    setLeftOptions(sortByName([...leftOptions, ...rightOptions2]));
    setRightOptions2([]);
    setSelectedRight2(new Set());
  };

  const resetData = () => {
    setTmpRightOptions1([]);
    setLeftOptions(sortByName(initialLeftOptions));
    setRightOptions1(sortByName(initialRightOptions1));
    setRightOptions2(sortByName(initialRightOptions2));
    setFinalOptions(sortByName(initialLFinalOptions));

    setSelectedLeft(new Set());
    setSelectedRight1(new Set());
    setSelectedRight2(new Set());
    setSelectedFinal(new Set());
    setSelectedRoles(
      new Set(
        userRoles
          .filter((role) => role != null && role.id != null)
          .map((role) => role.id)
      )
    );
  };

  const submitData = () => {
    const data = {
      rightOptions1,
      rightOptions2,
      finalOptions,
      tmpRightOptions1
    };
    if (onSubmit) {
      onSubmit(data);
    }
  };
  const handleCheckboxChange = (roleId) => {
    setSelectedRoles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(roleId)) {
        newSet.delete(roleId);
      } else {
        newSet.add(roleId);
      }
      return newSet;
    });
  };
  return (
    <ThemeProvider theme={theme === 'dark' ? darkTheme : lightTheme}>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <TextField
              label="Tìm kiếm quyền"
              fullWidth
              margin="normal"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
            <Paper style={{ height: '80%' }}>
              <TableContainer style={{ height: '100%', overflow: 'auto' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Typography variant="h6" fontWeight="bold">
                          Danh sách toàn bộ quyền
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filterLeftOptions().map((option) => (
                      <TableRow
                        key={option.value}
                        selected={selectedLeft.has(option.value)}
                        onClick={() =>
                          handleRowClick(option.value, setSelectedLeft)
                        }
                        hover
                        style={{ cursor: 'pointer' }}
                      >
                        <TableCell>{option.label}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          <Grid
            item
            xs={4}
            sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            <Grid
              container
              spacing={2}
              sx={{ flex: 1, flexDirection: 'column' }}
            >
              <Grid item xs={12} sx={{ flex: 1 }}>
                <Grid container spacing={2} sx={{ height: '100%' }}>
                  <Grid
                    item
                    xs={3}
                    sx={{ display: 'flex', flexDirection: 'column' }}
                    justifyContent="center"
                  >
                    <Paper
                      elevation={3}
                      style={{
                        padding: '16px',
                        borderRadius: '8px',
                        height: 'auto'
                      }}
                    >
                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                      >
                        <Button
                          variant="contained"
                          onClick={moveRight1}
                          disabled={selectedLeft.size === 0}
                        >
                          &gt;
                        </Button>
                        <Button
                          variant="contained"
                          onClick={moveLeft1}
                          style={{ marginTop: '8px' }}
                          disabled={selectedRight1.size === 0}
                        >
                          &lt;
                        </Button>
                        <Button
                          variant="contained"
                          onClick={moveAllRight1}
                          style={{ marginTop: '8px' }}
                        >
                          &gt;&gt;
                        </Button>
                        <Button
                          variant="contained"
                          onClick={moveAllLeft1}
                          style={{ marginTop: '8px' }}
                        >
                          &lt;&lt;
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid
                    item
                    xs={9}
                    sx={{ display: 'flex', flexDirection: 'column' }}
                  >
                    <Paper style={{ height: '300px' }}>
                      <TableContainer
                        style={{ height: '100%', overflow: 'auto' }}
                      >
                        <Table stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell>
                                <Typography
                                  variant="h6"
                                  fontWeight="bold"
                                  color="blue"
                                >
                                  Quyền cho phép
                                </Typography>
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {rightOptions1
                              .filter(
                                (option) =>
                                  !tmpRightOptions1.some(
                                    (tmpOption) =>
                                      tmpOption.value === option.value
                                  )
                              )
                              .map((option) => (
                                <TableRow
                                  key={option.value}
                                  selected={selectedRight1.has(option.value)}
                                  onClick={() =>
                                    handleRowClick(
                                      option.value,
                                      setSelectedRight1
                                    )
                                  }
                                  hover
                                  style={{ cursor: 'pointer' }}
                                >
                                  <TableCell>{option.label}</TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>

              {/* Second Row */}
              <Grid
                item
                xs={12}
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end'
                }}
              >
                <Grid container spacing={2} sx={{ height: '100%' }}>
                  <Grid
                    item
                    xs={3}
                    sx={{ display: 'flex', flexDirection: 'column' }}
                    justifyContent="center"
                  >
                    <Paper
                      elevation={3}
                      style={{
                        padding: '16px',
                        borderRadius: '8px',
                        height: 'auto'
                      }}
                    >
                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                      >
                        <Button
                          variant="contained"
                          onClick={moveRight2}
                          disabled={selectedLeft.size === 0}
                        >
                          &gt;
                        </Button>
                        <Button
                          variant="contained"
                          onClick={moveLeft2}
                          style={{ marginTop: '8px' }}
                          disabled={selectedRight2.size === 0}
                        >
                          &lt;
                        </Button>
                        <Button
                          variant="contained"
                          onClick={moveAllRight2}
                          style={{ marginTop: '8px' }}
                        >
                          &gt;&gt;
                        </Button>
                        <Button
                          variant="contained"
                          onClick={moveAllLeft2}
                          style={{ marginTop: '8px' }}
                        >
                          &lt;&lt;
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid
                    item
                    xs={9}
                    sx={{ display: 'flex', flexDirection: 'column' }}
                  >
                    <Paper style={{ height: '300px' }}>
                      <TableContainer
                        style={{ height: '100%', overflow: 'auto' }}
                      >
                        <Table stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell>
                                <Typography
                                  variant="h6"
                                  fontWeight="bold"
                                  color="red"
                                >
                                  Quyền cấm
                                </Typography>
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {rightOptions2.map((option) => (
                              <TableRow
                                key={option.value}
                                selected={selectedRight2.has(option.value)}
                                onClick={() =>
                                  handleRowClick(
                                    option.value,
                                    setSelectedRight2
                                  )
                                }
                                hover
                                style={{ cursor: 'pointer' }}
                              >
                                <TableCell>{option.label}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={1.5}>
            {allRoles.map((role) => (
              <Grid item xs={12} sm={6} md={4} key={role.id}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedRoles.has(role.id)}
                      onChange={() => handleCheckboxChange(role.id)}
                    />
                  }
                  label={role.role_name}
                />
              </Grid>
            ))}{' '}
          </Grid>
          <Grid item xs={0.5}>
            <Divider
              style={{ height: '82%' }}
              orientation="vertical"
              aria-hidden="true"
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label="Tìm kiếm quyền"
              fullWidth
              margin="normal"
              variant="outlined"
              value={searchQueryFinal}
              onChange={(e) => setSearchQueryFinal(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
            <Paper style={{ height: '70%', overflow: 'auto' }}>
              <TableContainer style={{ height: '100%', overflow: 'auto' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Typography variant="h6" fontWeight="bold">
                          Danh sách quyền đã chọn
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filterFinalOptions().map((option) => (
                      <TableRow
                        key={option.value}
                        selected={selectedFinal.has(option.value)}
                        onClick={() =>
                          handleRowClick(option.value, setSelectedFinal)
                        }
                        hover
                        style={{ cursor: 'pointer' }}
                      >
                        <TableCell>{option.label}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
            <Grid
              container
              spacing={2}
              justifyContent="flex-end"
              style={{ marginTop: '16px' }}
            >
              <Grid item>
                <Button variant="contained" color="primary" onClick={resetData}>
                  Reset
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={submitData}
                >
                  Submit
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
};

export default MoveItems;
