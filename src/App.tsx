import React from "react";
import "./App.css";
import { Box, Container } from "@mui/material";
import { Outlet } from "react-router";
import Sidebar from "./Sidebar";

function App() {
  return (
    <Box display="flex">
      <Sidebar />
      <Container>
        <Outlet />
      </Container>
    </Box>
  );
}

export default App;
