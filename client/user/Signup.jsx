import React, { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Box,
} from "@mui/material";
import { Link } from "react-router-dom";
import { create } from "./api-user";

export default function Signup() {
  const [values, setValues] = useState({
    name: "",
    username: "",
    password: "",
    email: "",
    error: "",
  });

  const [open, setOpen] = useState(false);

  const handleChange = useCallback((name) => (event) => {
    setValues(prev => ({ ...prev, [name]: event.target.value }));
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const clickSubmit = useCallback(() => {
    const user = {
      name: values.name || undefined,
      username: values.username || undefined,
      email: values.email || undefined,
      password: values.password || undefined,
    };

    create(user).then((data) => {
      if (data.error) {
        setValues(prev => ({ ...prev, error: data.error }));
      } else {
        setOpen(true);
      }
    });
  }, [values]);

  return (
    <div>
      <Card
        sx={{
          maxWidth: 400,
          margin: "0 auto",
          mt: 3,
          p: 2,
          textAlign: "center",
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ fontSize: 18 }}>
            Sign Up
          </Typography>

          <TextField
            id="name"
            label="Name"
            sx={{ width: "100%", mb: 2 }}
            value={values.name}
            onChange={handleChange("name")}
            margin="normal"
          />
          <TextField
            id="username"
            label="Username"
            sx={{ width: "100%", mb: 2 }}
            value={values.username}
            onChange={handleChange("username")}
            margin="normal"
            helperText="Username must be 3-20 characters, letters, numbers, and underscores only"
          />
          <TextField
            id="email"
            label="Email"
            sx={{ width: "100%", mb: 2 }}
            value={values.email}
            onChange={handleChange("email")}
            margin="normal"
          />
          <TextField
            id="password"
            label="Password"
            sx={{ width: "100%", mb: 2 }}
            value={values.password}
            onChange={handleChange("password")}
            type="password"
            margin="normal"
          />

          {values.error && (
            <Typography color="error" sx={{ mt: 1 }}>
              {values.error}
            </Typography>
          )}
        </CardContent>
        <CardActions>
          <Button
            color="primary"
            variant="contained"
            onClick={clickSubmit}
            sx={{ margin: "0 auto", mb: 2 }}
          >
            Submit
          </Button>
        </CardActions>
        <Box sx={{ textAlign: "center", pb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{" "}
            <Link 
              to="/signin" 
              style={{ 
                color: "#1976d2", 
                textDecoration: "none",
                fontWeight: "500"
              }}
            >
              Sign in
            </Link>
          </Typography>
        </Box>
      </Card>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>New Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            New account successfully created.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Link to="/signin">
            <Button
              color="primary"
              autoFocus
              variant="contained"
              onClick={handleClose}
            >
              Sign In
            </Button>
          </Link>
        </DialogActions>
      </Dialog>
    </div>
  );
}
