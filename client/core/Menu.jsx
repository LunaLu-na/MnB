import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import HomeIcon from "@mui/icons-material/Home";
import Button from "@mui/material/Button";
import auth from "../lib/auth-helper";
import { Link, useNavigate, useLocation } from "react-router-dom";

const isActive = (location, path) =>
  location.pathname === path ? "#e91e63" : "#4a4a4a"; // Pink for active, dark gray for inactive

export default function Menu() {
  const navigate = useNavigate();
  const location = useLocation();
  const jwt = auth.isAuthenticated();
  const isAdmin = jwt && jwt.user && jwt.user.admin;

  // Debug logging
  console.log("Menu - JWT:", jwt);
  console.log("Menu - isAdmin:", isAdmin);
  console.log("Menu - user.admin:", jwt?.user?.admin);

  return (
    <AppBar position="static" sx={{ 
      backgroundColor: "#ffffff", 
      color: "#4a4a4a",
      boxShadow: "0 2px 8px rgba(233, 30, 99, 0.1)",
      borderBottom: "1px solid #fce4ec",
    }}>
      <Toolbar sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <Typography variant="h6" sx={{ 
          flexGrow: 1, 
          color: "#e91e63", 
          fontWeight: 500,
          background: "linear-gradient(45deg, #e91e63 30%, #f48fb1 90%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          Migs & Bia
        </Typography>

        <Link to="/">
          <IconButton 
            aria-label="Home" 
            sx={{ 
              color: isActive(location, "/"),
              "&:hover": {
                backgroundColor: "rgba(233, 30, 99, 0.1)",
                color: "#e91e63",
              },
            }}
          >
            <HomeIcon />
          </IconButton>
        </Link>

        <Link to="/foryou">
          <Button sx={{ 
            color: isActive(location, "/foryou"),
            fontWeight: 500,
            "&:hover": {
              backgroundColor: "rgba(233, 30, 99, 0.1)",
              color: "#e91e63",
            },
          }}>
            For You
          </Button>
        </Link>

        <Link to="/gallery">
          <Button sx={{ 
            color: isActive(location, "/gallery"),
            fontWeight: 500,
            "&:hover": {
              backgroundColor: "rgba(233, 30, 99, 0.1)",
              color: "#e91e63",
            },
          }}>
            Gallery
          </Button>
        </Link>

        {isAdmin && (
          <Link to="/admin">
            <Button sx={{ 
              color: isActive(location, "/admin"),
              fontWeight: 500,
              "&:hover": {
                backgroundColor: "rgba(233, 30, 99, 0.1)",
                color: "#e91e63",
              },
            }}>
              Admin
            </Button>
          </Link>
        )}

        {!auth.isAuthenticated() && (
          <Link to="/signin">
            <Button sx={{ 
              color: isActive(location, "/signin"),
              fontWeight: 500,
              "&:hover": {
                backgroundColor: "rgba(233, 30, 99, 0.1)",
                color: "#e91e63",
              },
            }}>
              Sign In
            </Button>
          </Link>
        )}

        {auth.isAuthenticated() && (
          <>
            <Link to={`/user/${auth.isAuthenticated().user._id}`}>
              <Button
                sx={{
                  color: isActive(
                    location,
                    `/user/${auth.isAuthenticated().user._id}`
                  ),
                  fontWeight: 500,
                  "&:hover": {
                    backgroundColor: "rgba(233, 30, 99, 0.1)",
                    color: "#e91e63",
                  },
                }}
              >
                My Profile
              </Button>
            </Link>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}


