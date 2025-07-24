import { createTheme } from "@mui/material/styles";
import { pink } from "@mui/material/colors";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      light: "#f8bbd9", // soft pink
      main: "#e91e63", // medium pink
      dark: "#ad1457", // deeper pink
      contrastText: "#fff",
    },
    secondary: {
      light: "#fce4ec", // very light pink
      main: "#f48fb1", // warm pink
      dark: "#c2185b", // rose pink
      contrastText: "#333",
    },
    background: {
      default: "#fdfcfc", // warm white
      paper: "#ffffff", // pure white
    },
    text: {
      primary: "#4a4a4a", // soft charcoal
      secondary: "#757575", // medium gray
    },
    error: {
      main: "#d32f2f",
    },
    warning: {
      main: "#f57c00",
    },
    info: {
      main: "#1976d2",
    },
    success: {
      main: "#388e3c",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 300,
      color: "#4a4a4a",
    },
    h2: {
      fontWeight: 300,
      color: "#4a4a4a",
    },
    h3: {
      fontWeight: 400,
      color: "#4a4a4a",
    },
    h4: {
      fontWeight: 400,
      color: "#e91e63", // pink headers
    },
    h5: {
      fontWeight: 400,
      color: "#4a4a4a",
    },
    h6: {
      fontWeight: 500,
      color: "#4a4a4a",
    },
    body1: {
      color: "#4a4a4a",
      lineHeight: 1.6,
    },
    body2: {
      color: "#757575",
      lineHeight: 1.5,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          color: "#4a4a4a",
          boxShadow: "0 2px 8px rgba(233, 30, 99, 0.1)",
          borderBottom: "1px solid #fce4ec",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 500,
        },
        contained: {
          boxShadow: "0 2px 8px rgba(233, 30, 99, 0.2)",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(233, 30, 99, 0.3)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 2px 12px rgba(233, 30, 99, 0.08)",
          border: "1px solid #fce4ec",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 4px 20px rgba(233, 30, 99, 0.15)",
            transform: "translateY(-2px)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 2px 12px rgba(233, 30, 99, 0.06)",
        },
        elevation1: {
          boxShadow: "0 2px 8px rgba(233, 30, 99, 0.08)",
        },
        elevation3: {
          boxShadow: "0 4px 16px rgba(233, 30, 99, 0.12)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            backgroundColor: "#fdfcfc",
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#f48fb1",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#e91e63",
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
        colorPrimary: {
          backgroundColor: "#fce4ec",
          color: "#ad1457",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          "&.Mui-selected": {
            color: "#e91e63",
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: "#e91e63",
        },
      },
    },
  },
  custom: {
    openTitle: "#e91e63", // pink for titles
    protectedTitle: "#f48fb1", // warm pink
    cozyBackground: "#fdfcfc", // warm white background
    accentPink: "#fce4ec", // very light pink accent
    softPink: "#f8bbd9", // soft pink
  },
});

export default theme;
