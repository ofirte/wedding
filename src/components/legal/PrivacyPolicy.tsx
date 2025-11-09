import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";

const PrivacyPolicy: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        py: 8,
      }}
    >
      <Container maxWidth="md">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/")}
          sx={{ mb: 4 }}
        >
          Back to Home
        </Button>

        <Paper elevation={2} sx={{ p: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{ color: theme.palette.sage.dark, fontWeight: 700, mb: 3 }}
          >
            Privacy Policy
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Last Updated: {new Date().toLocaleDateString()}
          </Typography>

          <Box sx={{ "& > *": { mb: 3 } }}>
            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                1. Introduction
              </Typography>
              <Typography variant="body1" paragraph>
                Wedding Planner Studio ("we", "our", or "us") is committed to protecting
                your privacy. This Privacy Policy explains how we collect, use, disclose,
                and safeguard your information when you use our wedding planning platform.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                2. Information We Collect
              </Typography>
              <Typography variant="body1" paragraph>
                We collect information that you provide directly to us, including:
              </Typography>
              <Typography component="ul" variant="body1" sx={{ pl: 4 }}>
                <li>Account information (name, email address, password)</li>
                <li>Wedding details (date, venue, guest information)</li>
                <li>Budget and vendor information</li>
                <li>Communication preferences</li>
                <li>Payment information for premium features</li>
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                3. How We Use Your Information
              </Typography>
              <Typography variant="body1" paragraph>
                We use the information we collect to:
              </Typography>
              <Typography component="ul" variant="body1" sx={{ pl: 4 }}>
                <li>Provide, maintain, and improve our services</li>
                <li>Process your transactions and manage your account</li>
                <li>Send you technical notices, updates, and support messages</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Communicate with you about products, services, and events</li>
                <li>Monitor and analyze trends, usage, and activities</li>
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                4. Information Sharing and Disclosure
              </Typography>
              <Typography variant="body1" paragraph>
                We do not sell or rent your personal information to third parties. We may
                share your information only in the following circumstances:
              </Typography>
              <Typography component="ul" variant="body1" sx={{ pl: 4 }}>
                <li>With your consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and prevent fraud</li>
                <li>With service providers who assist in our operations</li>
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                5. Data Security
              </Typography>
              <Typography variant="body1" paragraph>
                We implement appropriate technical and organizational measures to protect
                your personal information against unauthorized access, alteration,
                disclosure, or destruction. However, no method of transmission over the
                Internet is 100% secure.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                6. Your Rights
              </Typography>
              <Typography variant="body1" paragraph>
                You have the right to:
              </Typography>
              <Typography component="ul" variant="body1" sx={{ pl: 4 }}>
                <li>Access and receive a copy of your personal data</li>
                <li>Correct inaccurate or incomplete data</li>
                <li>Request deletion of your data</li>
                <li>Object to or restrict processing of your data</li>
                <li>Data portability</li>
                <li>Withdraw consent at any time</li>
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                7. Cookies and Tracking Technologies
              </Typography>
              <Typography variant="body1" paragraph>
                We use cookies and similar tracking technologies to track activity on our
                service and hold certain information. You can instruct your browser to
                refuse all cookies or to indicate when a cookie is being sent.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                8. Children's Privacy
              </Typography>
              <Typography variant="body1" paragraph>
                Our service is not intended for children under 18 years of age. We do not
                knowingly collect personal information from children under 18.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                9. Changes to This Privacy Policy
              </Typography>
              <Typography variant="body1" paragraph>
                We may update our Privacy Policy from time to time. We will notify you of
                any changes by posting the new Privacy Policy on this page and updating
                the "Last Updated" date.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                10. Contact Us
              </Typography>
              <Typography variant="body1" paragraph>
                If you have any questions about this Privacy Policy, please contact us:
              </Typography>
              <Typography variant="body1">
                <strong>Email:</strong>{" "}
                <a href="mailto:ofirtene@weddingplannerstudioapp.com">
                  ofirtene@weddingplannerstudioapp.com
                </a>
              </Typography>
              <Typography variant="body1">
                <strong>WhatsApp:</strong>{" "}
                <a
                  href="https://wa.me/972542101631"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  054-210-1631
                </a>
              </Typography>
              <Typography variant="body1">
                <strong>Address:</strong> Yonatan Havipsi, Tel Aviv, Israel
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default PrivacyPolicy;
