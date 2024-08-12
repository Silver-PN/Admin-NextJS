import React, { useState, useEffect } from 'react';
import {
  Button,
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField // Import TextField for search input
} from '@mui/material';

const MoveItems = ({ userPermissions = [], allPermissions = [], onSubmit }) => {
  const [leftOptions, setLeftOptions] = useState([]);
  const [rightOptions, setRightOptions] = useState([]);
  const [initialLeftOptions, setInitialLeftOptions] = useState([]);
  const [initialRightOptions, setInitialRightOptions] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(new Set());
  const [selectedRight, setSelectedRight] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState(''); // State to hold the search query

  const sortByName = (options) => {
    return options.sort((a, b) => a.label.localeCompare(b.label));
  };

  useEffect(() => {
    const left = (userPermissions || []).map((id) => {
      const permission = allPermissions.find((p) => p.id === id);
      return {
        value: id,
        label: permission ? permission.name : ''
      };
    });

    const right = (allPermissions || [])
      .filter((permission) => !(userPermissions || []).includes(permission.id))
      .map((permission) => ({
        value: permission.id,
        label: permission.name
      }));

    setLeftOptions(sortByName(left));
    setRightOptions(sortByName(right));
    setInitialLeftOptions(sortByName(left));
    setInitialRightOptions(sortByName(right));
  }, [userPermissions, allPermissions]);

  useEffect(() => {
    const savedLeftOptions = localStorage.getItem('leftOptions');
    const savedRightOptions = localStorage.getItem('rightOptions');

    if (savedLeftOptions) {
      setLeftOptions(sortByName(JSON.parse(savedLeftOptions)));
    }
    if (savedRightOptions) {
      setRightOptions(sortByName(JSON.parse(savedRightOptions)));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('leftOptions', JSON.stringify(leftOptions));
    localStorage.setItem('rightOptions', JSON.stringify(rightOptions));
  }, [leftOptions, rightOptions]);

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

  const moveRight = () => {
    if (selectedLeft.size > 0) {
      const optionsToMove = leftOptions.filter((option) =>
        selectedLeft.has(option.value)
      );
      setRightOptions(sortByName([...rightOptions, ...optionsToMove]));
      setLeftOptions(
        leftOptions.filter((option) => !selectedLeft.has(option.value))
      );
      setSelectedLeft(new Set());
    } else {
      alert('You must first select at least one item on the left side.');
    }
  };

  const moveLeft = () => {
    if (selectedRight.size > 0) {
      const optionsToMove = rightOptions.filter((option) =>
        selectedRight.has(option.value)
      );
      setLeftOptions(sortByName([...leftOptions, ...optionsToMove]));
      setRightOptions(
        rightOptions.filter((option) => !selectedRight.has(option.value))
      );
      setSelectedRight(new Set());
    } else {
      alert('You must first select at least one item on the right side.');
    }
  };

  const moveAllRight = () => {
    setRightOptions(sortByName([...rightOptions, ...leftOptions]));
    setLeftOptions([]);
    setSelectedLeft(new Set());
  };

  const moveAllLeft = () => {
    setLeftOptions(sortByName([...leftOptions, ...rightOptions]));
    setRightOptions([]);
    setSelectedRight(new Set());
  };

  const resetData = () => {
    setLeftOptions(sortByName(initialLeftOptions));
    setRightOptions(sortByName(initialRightOptions));
    setSelectedLeft(new Set());
    setSelectedRight(new Set());
  };

  const submitData = () => {
    const data = {
      leftOptions: leftOptions.map((option) => option.value),
      rightOptions: rightOptions.map((option) => option.value)
    };
    if (onSubmit) {
      onSubmit(data);
    }
  };

  const filterLeftOptions = () => {
    return leftOptions.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <Container>
      <Grid
        container
        spacing={2}
        alignItems="flex-start"
        justifyContent="center"
      >
        <Grid item xs={5}>
          <TextField
            label="Search"
            fullWidth
            margin="normal"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Paper>
            <TableContainer style={{ height: '400px', overflow: 'auto' }}>
              <Table>
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
        <Grid item xs={2} container direction="column" alignItems="center">
          <Button
            variant="contained"
            onClick={moveRight}
            style={{ marginBottom: '8px' }}
            disabled={selectedLeft.size === 0}
          >
            &gt;&gt;
          </Button>
          <Button
            variant="contained"
            onClick={moveLeft}
            disabled={selectedRight.size === 0}
          >
            &lt;&lt;
          </Button>
        </Grid>
        <Grid item xs={5}>
          <Paper>
            <TableContainer style={{ height: '400px', overflow: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography variant="h6" fontWeight="bold">
                        Danh sách quyền chưa chọn
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rightOptions.map((option) => (
                    <TableRow
                      key={option.value}
                      selected={selectedRight.has(option.value)}
                      onClick={() =>
                        handleRowClick(option.value, setSelectedRight)
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
      <Grid
        container
        spacing={2}
        justifyContent="center"
        style={{ marginTop: '16px' }}
      >
        <Grid item>
          <Button
            variant="outlined"
            onClick={resetData}
            style={{ marginRight: '8px' }}
          >
            Reset
          </Button>
        </Grid>
        <Grid item>
          <Button variant="contained" onClick={submitData}>
            Submit
          </Button>
        </Grid>
      </Grid>
      <Grid
        container
        spacing={2}
        justifyContent="center"
        style={{ marginTop: '16px' }}
      >
        <Grid item>
          <Button
            variant="contained"
            onClick={moveAllRight}
            style={{ marginRight: '8px' }}
          >
            Move All Right
          </Button>
        </Grid>
        <Grid item>
          <Button variant="contained" onClick={moveAllLeft}>
            Move All Left
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MoveItems;
