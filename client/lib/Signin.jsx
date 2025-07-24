import React, { useState, useCallback } from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Icon from "@mui/material/Icon";
import Box from "@mui/material/Box";
import auth from "./auth-helper.js";
import { Navigate, useLocation, Link } from "react-router-dom";
import { signin } from "./api-auth.js";

export default function Signin() {
  const location = useLocation();

  const [values, setValues] = useState({
    username: "",
    password: "",
    error: "",
    redirectToReferrer: false,
  });

  const clickSubmit = useCallback(() => {
    const user = {
      username: values.username || undefined,
      password: values.password || undefined,
    };
    signin(user).then((data) => {
      if (data.error) {
        setValues({ ...values, error: data.error });
      } else {
        auth.authenticate(data, () => {
          setValues({ ...values, error: "", redirectToReferrer: true });
        });
      }
    });
  }, [values]);

  const handleChange = useCallback((name) => (event) => {
    setValues(prev => ({ ...prev, [name]: event.target.value }));
  }, []);

  const { from } = location.state || {
    from: { pathname: "/" },
  };

  const { redirectToReferrer } = values;
  if (redirectToReferrer) {
    return <Navigate to={from} />;
  }

  return (
    <Card
      sx={{
        maxWidth: 600,
        margin: "auto",
        textAlign: "center",
        mt: 5,
        pb: 2,
      }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ mt: 2, color: "text.primary" }}>
          Sign In
        </Typography>
        <TextField
          id="username"
          type="text"
          label="Username"
          sx={{ mx: 1, width: 300 }}
          value={values.username}
          onChange={handleChange("username")}
          margin="normal"
        />
        <br />
        <TextField
          id="password"
          type="password"
          label="Password"
          sx={{ mx: 1, width: 300 }}
          value={values.password}
          onChange={handleChange("password")}
          margin="normal"
        />
        <br />
        {values.error && (
          <Typography component="p" color="error" sx={{ mt: 1 }}>
            <Icon color="error" sx={{ verticalAlign: "middle", mr: 0.5 }}>
              error
            </Icon>
            {values.error}
          </Typography>
        )}
      </CardContent>
      <CardActions>
        <Button
          color="primary"
          variant="contained"
          onClick={clickSubmit}
          sx={{ margin: "auto", mb: 2 }}
        >
          Submit
        </Button>
      </CardActions>
      <Box sx={{ textAlign: "center", pb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Don't have an account?{" "}
          <Link 
            to="/signup" 
            style={{ 
              color: "#1976d2", 
              textDecoration: "none",
              fontWeight: "500"
            }}
          >
            Sign up
          </Link>
        </Typography>
      </Box>
    </Card>
  );
}
