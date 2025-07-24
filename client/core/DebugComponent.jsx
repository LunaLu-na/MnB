import React, { useState, useCallback, memo, useRef } from "react";
import { TextField, Paper, Typography, Box } from "@mui/material";

const DebugComponent = memo(() => {
  const [value, setValue] = useState("");
  const renderCount = useRef(0);
  
  renderCount.current += 1;
  
  const handleChange = useCallback((e) => {
    setValue(e.target.value);
  }, []);
  
  console.log(`DebugComponent rendered ${renderCount.current} times, value: "${value}"`);
  
  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h6" gutterBottom>
        Debug Input Test (Renders: {renderCount.current})
      </Typography>
      <Box sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Test Input - Should not lose focus"
          value={value}
          onChange={handleChange}
          variant="outlined"
          placeholder="Type here to test cursor stability..."
        />
      </Box>
      <Typography variant="body2" sx={{ mt: 1 }}>
        Current value: {value}
      </Typography>
    </Paper>
  );
});

DebugComponent.displayName = 'DebugComponent';

export default DebugComponent;
