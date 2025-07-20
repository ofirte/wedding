import React from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Grid,
  useTheme,
  Card,
  CardContent,
  Chip,
  Divider,
  Avatar,
} from "@mui/material";
import {
  Favorite as FavoriteIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  AttachMoney as AttachMoneyIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  PhotoCamera as PhotoCameraIcon,
  Restaurant as RestaurantIcon,
  MusicNote as MusicNoteIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router";
import { useTranslation } from "../../localization/LocalizationContext";

const LandingPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const features = [
    {
      icon: <PeopleIcon sx={{ fontSize: 48 }} />,
      title: "Guest Management",
      description:
        "Organize your wedding guest list, track RSVPs, and manage dietary preferences effortlessly",
      highlight: "Smart RSVP tracking",
    },
    {
      icon: <AttachMoneyIcon sx={{ fontSize: 48 }} />,
      title: "Budget Planning",
      description:
        "Keep track of your wedding expenses, compare vendor prices, and stay within budget",
      highlight: "Real-time expense tracking",
    },
    {
      icon: <AssignmentIcon sx={{ fontSize: 48 }} />,
      title: "Task Management",
      description:
        "Never miss important wedding planning tasks with timeline management and reminders",
      highlight: "Automated reminders",
    },
    {
      icon: <PhotoCameraIcon sx={{ fontSize: 48 }} />,
      title: "Vendor Coordination",
      description:
        "Manage photographers, caterers, and all vendors in one centralized platform",
      highlight: "Vendor communication hub",
    },
    {
      icon: <ScheduleIcon sx={{ fontSize: 48 }} />,
      title: "Timeline Planning",
      description:
        "Create detailed wedding day schedules and share with your wedding party",
      highlight: "Day-of coordination",
    },
    {
      icon: <MusicNoteIcon sx={{ fontSize: 48 }} />,
      title: "Entertainment Planning",
      description:
        "Plan music, activities, and entertainment for your special day",
      highlight: "Playlist management",
    },
  ];

  const testimonials = [
    {
      name: "Sarah & Michael",
      review:
        "This app made planning our wedding so much easier! The budget tracker saved us thousands.",
      rating: 5,
      avatar: "S",
    },
    {
      name: "Emma & David",
      review:
        "Love how organized everything is. Our families could track RSVPs in real-time!",
      rating: 5,
      avatar: "E",
    },
    {
      name: "Jessica & Ryan",
      review:
        "The timeline feature helped us coordinate our entire wedding day perfectly.",
      rating: 5,
      avatar: "J",
    },
  ];



  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${theme.palette.cream.light}, ${theme.palette.sage.light})`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative background elements */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 20% 50%, ${theme.palette.sage.main}20 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${theme.palette.cream.main}40 0%, transparent 50%)`,
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, py: 8 }}>
        {/* Hero Section */}
        <Box
          sx={{
            textAlign: "center",
            mb: 12,
            color: theme.palette.sage.dark,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mb: 3,
              gap: 2,
            }}
          >
            <FavoriteIcon
              sx={{
                fontSize: 80,
                color: theme.palette.error.main,
                filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
                animation: "pulse 2s infinite",
                "@keyframes pulse": {
                  "0%": { transform: "scale(1)" },
                  "50%": { transform: "scale(1.05)" },
                  "100%": { transform: "scale(1)" },
                },
              }}
            />
          </Box>

          <Typography
            variant="h1"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              fontSize: { xs: "3rem", md: "4.5rem" },
              background: `linear-gradient(45deg, ${theme.palette.sage.dark}, ${theme.palette.primary.main})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 2px 4px rgba(0,0,0,0.1)",
              mb: 2,
            }}
          >
            Wedding Planner
          </Typography>

          <Typography
            variant="h4"
            sx={{
              color: theme.palette.sage.dark,
              fontSize: { xs: "1.5rem", md: "2rem" },
              fontWeight: 300,
              maxWidth: "600px",
              margin: "0 auto",
              mb: 6,
            }}
          >
            Plan your perfect wedding day with elegance and ease
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 3,
              justifyContent: "center",
              flexWrap: "wrap",
              mb: 4,
            }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/register")}
              sx={{
                bgcolor: theme.palette.sage.main,
                color: "white",
                px: 6,
                py: 2,
                fontSize: "1.2rem",
                borderRadius: "50px",
                textTransform: "none",
                fontWeight: 600,
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: theme.palette.sage.dark,
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 32px rgba(0,0,0,0.2)",
                },
              }}
            >
              Start Planning Free
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/login")}
              sx={{
                borderColor: theme.palette.sage.main,
                color: theme.palette.sage.dark,
                px: 6,
                py: 2,
                fontSize: "1.2rem",
                borderRadius: "50px",
                textTransform: "none",
                fontWeight: 600,
                borderWidth: 2,
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: theme.palette.sage.dark,
                  bgcolor: theme.palette.sage.main + "10",
                  transform: "translateY(-2px)",
                },
              }}
            >
              Sign In
            </Button>
          </Box>

          <Typography
            variant="body2"
            sx={{
              color: theme.palette.sage.main,
              fontSize: "0.9rem",
            }}
          >
            ✨ No credit card required • Free 30-day trial
          </Typography>
        </Box>

        {/* Features Section */}
        <Box sx={{ mb: 12 }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              textAlign: "center",
              mb: 2,
              fontWeight: 700,
              color: theme.palette.sage.dark,
              fontSize: { xs: "2rem", md: "2.5rem" },
            }}
          >
            Everything You Need
          </Typography>
          <Typography
            variant="h6"
            sx={{
              textAlign: "center",
              color: theme.palette.sage.main,
              maxWidth: "600px",
              margin: "0 auto",
              mb: 8,
            }}
          >
            Comprehensive wedding planning tools designed for modern couples
          </Typography>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid key={index} size={{ xs: 12, md: 6, lg: 4 }}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    borderRadius: 4,
                    border: `2px solid ${theme.palette.cream.dark}`,
                    backgroundColor: "rgba(255,255,255,0.8)",
                    backdropFilter: "blur(10px)",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                      borderColor: theme.palette.sage.main,
                    },
                  }}
                >
                  <CardContent sx={{ p: 4, textAlign: "center" }}>
                    <Box
                      sx={{
                        color: theme.palette.sage.main,
                        mb: 3,
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      {feature.icon}
                    </Box>

                    <Chip
                      label={feature.highlight}
                      size="small"
                      sx={{
                        mb: 2,
                        bgcolor: theme.palette.sage.light,
                        color: theme.palette.sage.dark,
                        fontSize: "0.75rem",
                      }}
                    />

                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.sage.dark,
                        mb: 2,
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.sage.main,
                        lineHeight: 1.6,
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Call to Action */}
        <Box
          sx={{
            textAlign: "center",
            mt: 8,
            p: 4,
            bgcolor: "rgba(255,255,255,0.1)",
            borderRadius: 3,
            color: "white",
          }}
        >
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Ready to start planning?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
            Join thousands of couples who have planned their perfect wedding
            with us
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/register")}
            sx={{
              bgcolor: "white",
              color: "primary.main",
              px: 4,
              py: 1.5,
              fontSize: "1.1rem",
              "&:hover": {
                bgcolor: "grey.100",
              },
            }}
          >
            Start Planning Today
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;
