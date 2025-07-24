import React, { useState, useEffect } from "react";
import {
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Avatar,
  IconButton,
  Typography,
  Divider,
  Button,
  Box,
  Tabs,
  Tab,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import PersonIcon from "@mui/icons-material/Person";
import DeleteUser from "./DeleteUser";
import auth from "../lib/auth-helper.js";
import { read } from "./api-user.js";
import { useLocation, Navigate, Link, useParams, useNavigate } from "react-router-dom";

export default function Profile() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [redirectToSignin, setRedirectToSignin] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const jwt = auth.isAuthenticated();
  const { userId } = useParams();

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    read({ userId }, { t: jwt.token }, signal).then((data) => {
      if (data && data.error) {
        setRedirectToSignin(true);
      } else {
        setUser(data);
      }
    });

    return () => abortController.abort();
  }, [userId]);

  const handleSignout = () => {
    auth.clearJWT(() => {
      navigate("/signin");
    });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const TabPanel = ({ children, value, index, ...other }) => {
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`profile-tabpanel-${index}`}
        aria-labelledby={`profile-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
      </div>
    );
  };

  if (redirectToSignin) {
    return (
      <Navigate to="/signin" state={{ from: location.pathname }} replace />
    );
  }

  return (
    <Paper
      elevation={4}
      sx={{
        maxWidth: 800,
        mx: "auto",
        mt: 3,
        mb: 3,
      }}
    >
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h4" gutterBottom sx={{ color: "primary.main" }}>
          My Profile
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="profile tabs">
            <Tab icon={<PersonIcon />} label="Profile Info" id="profile-tab-0" aria-controls="profile-tabpanel-0" />
          </Tabs>
        </Box>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <Box sx={{ p: 3 }}>
          <List dense>
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <PersonIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText 
                primary={
                  <Typography variant="h6" component="span">
                    {user.name}
                  </Typography>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      @{user.username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                }
              />
              {auth.isAuthenticated().user &&
                auth.isAuthenticated().user._id === user._id && (
                  <ListItemSecondaryAction>
                    <Link to={`/user/edit/${user._id}`}>
                      <IconButton aria-label="Edit" color="primary">
                        <EditIcon />
                      </IconButton>
                    </Link>
                    <DeleteUser userId={user._id} />
                  </ListItemSecondaryAction>
                )}
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="body1">
                    Member since
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    {user.created
                      ? new Date(user.created).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Loading..."}
                  </Typography>
                }
              />
            </ListItem>
            {user.admin && (
              <>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography variant="body1" sx={{ color: "primary.main", fontWeight: 600 }}>
                        Administrator
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        This user has administrative privileges
                      </Typography>
                    }
                  />
                </ListItem>
              </>
            )}
          </List>
          
          {auth.isAuthenticated().user && auth.isAuthenticated().user._id === user._id && (
            <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Button
                color="secondary"
                variant="outlined"
                onClick={handleSignout}
                fullWidth
                sx={{ 
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: "1rem"
                }}
              >
                Sign Out
              </Button>
            </Box>
          )}
        </Box>
      </TabPanel>
    </Paper>
  );
}
