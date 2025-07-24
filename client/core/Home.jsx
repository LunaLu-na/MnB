import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import unicornbikeImg from "./../assets/images/unicornbikeImg.jpg";
import DebugComponent from "./DebugComponent";

const Home = () => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        maxWidth: 900,
        margin: "auto",
        mt: 5,
        borderRadius: 3,
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(233, 30, 99, 0.1)",
        boxShadow: "0 8px 32px rgba(233, 30, 99, 0.1)",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          px: 3,
          pt: 4,
          pb: 2,
          textAlign: "center",
          background: "linear-gradient(45deg, #e91e63 30%, #f48fb1 90%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontWeight: 300,
        }}
      >
        Welcome to Migs & Bia
      </Typography>
      <CardMedia
        sx={{ 
          minHeight: 400,
          borderRadius: "12px 12px 0 0",
          filter: "brightness(1.05) saturate(1.1)",
        }}
        image={unicornbikeImg}
        title="Unicorn Bike"
      />
      <CardContent sx={{ p: 3 }}>
        <Typography 
          variant="body1" 
          component="p" 
          sx={{ 
            textAlign: "center",
            color: "#4a4a4a",
            lineHeight: 1.6,
            fontSize: "1.1rem",
          }}
        >
          A cozy space filled with love, memories, and beautiful moments. 
          Explore our letters, gallery, and connect with our community.
        </Typography>
      </CardContent>
      
      {/* Debug Component to test input stability */}
      <DebugComponent />
    </Card>
  );
};

export default Home;
