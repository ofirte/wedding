import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  Container,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Stack,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  HourglassEmpty as PendingIcon,
} from "@mui/icons-material";
import { getPaymentStatus } from "../api/firebaseFunctions/payments";
import { PaymentStatus as PaymentStatusEnum } from "@wedding-plan/types";

const PaymentStatus: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<PaymentStatusEnum | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const paymentId = searchParams.get("paymentId");
  const weddingId = searchParams.get("weddingId");

  useEffect(() => {
    const checkStatus = async () => {
      if (!paymentId) {
        setError("Invalid payment reference");
        setLoading(false);
        return;
      }

      try {
        const result = await getPaymentStatus({ paymentId });

        if (result.data.success) {
          setStatus(result.data.status);
        } else {
          setError("Failed to check payment status");
        }
      } catch (err: any) {
        console.error("Payment status check error:", err);
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    checkStatus();

    // Poll for status if pending
    const intervalId = setInterval(() => {
      if (status === PaymentStatusEnum.PENDING) {
        checkStatus();
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(intervalId);
  }, [paymentId, status]);

  const handleContinue = () => {
    if (weddingId) {
      navigate(`/wedding/${weddingId}`);
    } else {
      navigate("/");
    }
  };

  const handleRetry = () => {
    navigate("/rsvp/pricing");
  };

  if (loading && !status) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper
          elevation={3}
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 4,
          }}
        >
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h5" gutterBottom>
            Checking Payment Status...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we verify your payment
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper
          elevation={3}
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 4,
          }}
        >
          <ErrorIcon
            sx={{ fontSize: 80, color: "error.main", mb: 2 }}
          />
          <Typography variant="h4" gutterBottom color="error.main">
            Error
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            {error}
          </Typography>
          <Stack spacing={2} direction="row" justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              onClick={handleRetry}
              size="large"
            >
              Try Again
            </Button>
            <Button variant="outlined" onClick={() => navigate("/")}>
              Go Home
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  if (status === PaymentStatusEnum.COMPLETED) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper
          elevation={3}
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 4,
            background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
          }}
        >
          <CheckCircleIcon
            sx={{ fontSize: 80, color: "success.main", mb: 2 }}
          />
          <Typography variant="h4" gutterBottom color="success.main">
            Payment Successful!
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Your wedding has been upgraded to the Premium RSVP plan.
          </Typography>
          <Alert severity="success" sx={{ mb: 4, textAlign: "left" }}>
            <Typography variant="body2">
              You now have access to:
            </Typography>
            <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
              <li>3 automated RSVP message rounds</li>
              <li>Phone call service for non-responders</li>
              <li>Event day reminders with Waze navigation</li>
              <li>Post-event thank you messages</li>
              <li>Custom message design</li>
              <li>Smart tracking & reports</li>
            </ul>
          </Alert>
          <Button
            variant="contained"
            color="primary"
            onClick={handleContinue}
            size="large"
            fullWidth
          >
            Continue to Wedding Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  if (status === PaymentStatusEnum.PENDING) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper
          elevation={3}
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 4,
          }}
        >
          <PendingIcon
            sx={{ fontSize: 80, color: "warning.main", mb: 2 }}
          />
          <Typography variant="h4" gutterBottom color="warning.main">
            Payment Pending
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Your payment is being processed. This may take a few moments.
          </Typography>
          <CircularProgress size={40} sx={{ mb: 3 }} />
          <Typography variant="body2" color="text.secondary">
            Checking status automatically...
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (status === PaymentStatusEnum.FAILED) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper
          elevation={3}
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 4,
          }}
        >
          <ErrorIcon
            sx={{ fontSize: 80, color: "error.main", mb: 2 }}
          />
          <Typography variant="h4" gutterBottom color="error.main">
            Payment Failed
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            We couldn't process your payment. Please try again or contact support.
          </Typography>
          <Stack spacing={2} direction="row" justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              onClick={handleRetry}
              size="large"
            >
              Try Again
            </Button>
            <Button variant="outlined" onClick={() => navigate("/")}>
              Go Home
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return null;
};

export default PaymentStatus;
