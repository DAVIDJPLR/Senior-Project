import { Typography, Divider, useTheme, Box, Stack, Button, useMediaQuery, Toolbar, IconButton, MenuItem, Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton } from "@mui/material/";
import { StudentScreen, Screen } from "../custom_objects/Screens";
import HomeIcon from "@mui/icons-material/Home"
import SearchIcon from "@mui/icons-material/Search"
import HistoryIcon from "@mui/icons-material/History"
import MenuIcon from "@mui/icons-material/Menu"
import React, { useState } from "react";

interface Props{
    currentScreen: Screen
    setCurrentScreen: (screen: Screen) => void
}

const navItems = [
    {label: "Browse", icon: <SearchIcon />, screen: StudentScreen.Browse},
    {label: "Home", icon: <HomeIcon />, screen: StudentScreen.Home},
    {label: "Recently Viewed", icon: <HistoryIcon />, screen: StudentScreen.Recently_Viewed},
]

function StudentAppBar ({ currentScreen, setCurrentScreen }: Props) {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

    const [mobileOpen, setMobileOpen] = useState(false)

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen)
    }

    return (
    <Box sx={{ width: "100%", backgroundColor: theme => theme.palette.secondary.main, py: 1 }}>
      <Toolbar sx={{ justifyContent: "space-between", px: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "white" }}>
          help.gcc.edu
        </Typography>

        {isMobile ? (
          <>
            <IconButton
              color="inherit"
              edge="end"
              onClick={handleDrawerToggle}
              sx={{ color: "white" }}
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="right"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              PaperProps={{ sx: { 
                width: 240,
                backgroundColor: "rgba(90,30,30,0.7)",
                backdropFilter: "blur(12px)",
                border: "none",
                boxShadow: 12
             } }}
            >
              <List>
                  {navItems.map((item) => (
                    <ListItem disablePadding key={item.screen}>
                      <ListItemButton
                        onClick={() => {
                          setCurrentScreen(item.screen);
                          setMobileOpen(false);
                        }}
                        sx={{
                          px: 2,
                          py: 1.5,
                          '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          },
                          '&.Mui-selected': {
                          backgroundColor: 'rgba(255, 255, 255, 0.16)',
                          },
                        }}
                        selected={item.screen === currentScreen}
                    >
                    <ListItemIcon sx={{ color: "white", minWidth: 36 }}>
                        {item.icon}
                    </ListItemIcon>
                    <ListItemText
              primary={
                <Typography
                  sx={{
                    color: "white",
                    fontWeight: 500,
                    fontSize: "1rem"
                  }}
                >
                  {item.label}
                </Typography>
              }
            />
          </ListItemButton>
        </ListItem>
    ))}
    </List>
            </Drawer>
          </>
        ) : (
          <Stack direction="row" spacing={2} alignItems="center">
            {navItems.map((item, index) => (
              <React.Fragment key={item.screen}>
                <Button
                  onClick={() => setCurrentScreen(item.screen)}
                  startIcon={item.icon}
                  variant={currentScreen === item.screen ? "contained" : "text"}
                  sx={{
                    fontWeight: 600,
                    fontSize: "1rem",
                    color: currentScreen === item.screen ? "black" : "white",
                    backgroundColor: currentScreen === item.screen ? "white" : "transparent",
                    textTransform: "none",
                    px: 2,
                    py: 1.25,
                    borderRadius: 2,
                    "&:hover": {
                      backgroundColor:
                        currentScreen === item.screen
                          ? "white"
                          : "rgba(255, 255, 255, 0.1)"
                    }
                  }}
                >
                  {item.label}
                </Button>
                {index < navItems.length - 1 && (
                  <Divider orientation="vertical" flexItem sx={{ borderColor: "black", height: 28 }} />
                )}
              </React.Fragment>
            ))}
          </Stack>
        )}
      </Toolbar>
    </Box>
  );
}

export default StudentAppBar