import React, { useState } from "react";
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
import { Link as RouterLink, useNavigate } from "react-router";
import { useSignIn } from "../../hooks/auth";
import { useSignInWithGoogle } from "../../hooks/auth/useSignInWithGoogle";
import GoogleSignInButton from "./GoogleSignInButton";
import { useTranslation } from "../../localization/LocalizationContext";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const signInMutateOptions = {
    onSuccess: () => {
      navigate("/wedding");
    },
    onError: (error: any) => {
      setError(error.message || t("common.failedToSignIn"));
    },
  };
  const { mutate: signIn, isPending } = useSignIn(signInMutateOptions);
  const { mutate: signInWithGoogle, isPending: isGoogleSignInPending } =
    useSignInWithGoogle(signInMutateOptions);
  const navigate = useNavigate();

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
              to="/register"
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
