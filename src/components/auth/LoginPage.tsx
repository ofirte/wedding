import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Link,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router";
import { useSignIn } from "../../hooks/auth";
import { useSignInWithGoogle } from "../../hooks/auth/useSignInWithGoogle";
import GoogleSignInButton from "./GoogleSignInButton";
import { useTranslation } from "../../localization/LocalizationContext";
import { saveInvitationToken } from "../../hooks/invitations/invitationStorage";
import InvitationBanner from "./InvitationBanner";
import { useAuth } from "../../hooks/auth";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser, role, isClaimsLoading } = useAuth();

  // Check for invitation token in URL
  const inviteToken = searchParams.get("inviteToken");

  // Save invitation token to localStorage when component mounts
  useEffect(() => {
    if (inviteToken) {
      saveInvitationToken(inviteToken);
    }
  }, [inviteToken]);

  // Wait for role to be initialized, then navigate based on role
  useEffect(() => {
    if (isAuthenticating && currentUser && !isClaimsLoading && role !== "not set") {
      // Role is initialized, now navigate based on role
      const inviteCode = searchParams.get("invite");

      if (role === "producer") {
        navigate("/weddings/manage");
      } else {
        const targetUrl = inviteCode
          ? `/wedding?invite=${inviteCode}`
          : "/wedding";
        navigate(targetUrl);
      }

      setIsAuthenticating(false);
    }
  }, [isAuthenticating, currentUser, role, isClaimsLoading, navigate, searchParams]);

  const signInMutateOptions = {
    onSuccess: () => {
      // Set flag to wait for role initialization
      setIsAuthenticating(true);
    },
    onError: (error: any) => {
      setError(error.message || t("common.failedToSignIn"));
      setIsAuthenticating(false);
    },
  };
  const { mutate: signIn, isPending } = useSignIn(signInMutateOptions);
  const { mutate: signInWithGoogle, isPending: isGoogleSignInPending } =
    useSignInWithGoogle(signInMutateOptions);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      signIn({ email, password });
    } catch (err: any) {
      setError(err.message || t("common.unexpectedError"));
    }
  };

  return (
    <Grid container sx={{ height: "100vh", justifyContent: "center" }}>
      <Grid
        size={{ xs: 12, sm: 8, md: 5 }}
        component={Paper}
        elevation={6}
        square
      >
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            component="h1"
            variant="h5"
            sx={{
              fontWeight: 300,
              fontSize: "2rem",
              color: ({ palette }) => palette.primary.main,
            }}
          >
            {t("wedding.studio")}
          </Typography>
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ mt: 1, width: "100%", maxWidth: 400 }}
          >
            <InvitationBanner token={inviteToken} />
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label={t("common.emailAddress")}
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label={t("common.password")}
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                backgroundColor: ({ palette }) => palette.primary.light,
                color: "white",
                fontWeight: 600,
                fontSize: "1rem",
                textTransform: "none",
              }}
              disabled={isPending}
            >
              {isPending ? <CircularProgress size={24} /> : t("common.signIn")}
            </Button>
            <GoogleSignInButton
              onClick={() => signInWithGoogle({})}
              isLoading={isGoogleSignInPending}
            />

            <Link
              sx={{
                display: "block",
                textAlign: "center",
                mt: 2,
                color: ({ palette }) => palette.primary.main,
              }}
              component={RouterLink}
              to={{
                pathname: "/register",
                search: window.location.search,
              }}
              variant="body2"
            >
              {t("common.dontHaveAccount")}
            </Link>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default LoginPage;
