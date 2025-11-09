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

const TermsOfService: React.FC = () => {
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
            Terms of Service
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Last Updated: {new Date().toLocaleDateString()}
          </Typography>

          <Box sx={{ "& > *": { mb: 3 } }}>
            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                1. Acceptance of Terms
              </Typography>
              <Typography variant="body1" paragraph>
                By accessing and using Wedding Planner Studio ("Service"), you accept and
                agree to be bound by the terms and provisions of this agreement. If you do
                not agree to these Terms of Service, please do not use our Service.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                2. Description of Service
              </Typography>
              <Typography variant="body1" paragraph>
                Wedding Planner Studio provides a comprehensive wedding planning platform
                that includes:
              </Typography>
              <Typography component="ul" variant="body1" sx={{ pl: 4 }}>
                <li>Guest list management and RSVP tracking</li>
                <li>Budget planning and expense tracking</li>
                <li>Task management and timeline planning</li>
                <li>Seating arrangement tools</li>
                <li>Vendor coordination</li>
                <li>Communication and notification services</li>
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                3. User Accounts
              </Typography>
              <Typography variant="body1" paragraph>
                To use our Service, you must:
              </Typography>
              <Typography component="ul" variant="body1" sx={{ pl: 4 }}>
                <li>Be at least 18 years of age</li>
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Be responsible for all activities under your account</li>
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                4. Subscription and Payment
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Free Trial:</strong> We offer a 30-day free trial period for new
                users to explore all features of our platform.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Premium Features:</strong> After the trial period, continued
                access to premium features requires a paid subscription. Payment terms and
                pricing will be clearly displayed before purchase.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Refunds:</strong> Refund policies will be determined on a
                case-by-case basis in accordance with applicable consumer protection laws.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                5. User Content and Conduct
              </Typography>
              <Typography variant="body1" paragraph>
                You retain ownership of all content you submit to the Service. By
                submitting content, you grant us a license to use, store, and display your
                content as necessary to provide the Service.
              </Typography>
              <Typography variant="body1" paragraph>
                You agree not to:
              </Typography>
              <Typography component="ul" variant="body1" sx={{ pl: 4 }}>
                <li>Use the Service for any illegal purpose</li>
                <li>Violate any laws in your jurisdiction</li>
                <li>Infringe upon intellectual property rights</li>
                <li>Transmit malicious code or interfere with the Service</li>
                <li>Impersonate others or provide false information</li>
                <li>Harass, abuse, or harm other users</li>
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                6. Intellectual Property
              </Typography>
              <Typography variant="body1" paragraph>
                The Service and its original content, features, and functionality are owned
                by Wedding Planner Studio and are protected by international copyright,
                trademark, patent, trade secret, and other intellectual property laws.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                7. Data Backup and Loss
              </Typography>
              <Typography variant="body1" paragraph>
                While we take reasonable measures to backup data, we recommend that you
                maintain your own backups of important information. We are not responsible
                for any data loss, though we will make reasonable efforts to recover data
                when possible.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                8. Service Availability
              </Typography>
              <Typography variant="body1" paragraph>
                We strive to maintain high availability of our Service but do not guarantee
                uninterrupted access. We may perform maintenance, updates, or experience
                technical issues that temporarily affect service availability.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                9. Limitation of Liability
              </Typography>
              <Typography variant="body1" paragraph>
                To the maximum extent permitted by law, Wedding Planner Studio shall not be
                liable for any indirect, incidental, special, consequential, or punitive
                damages resulting from your use or inability to use the Service.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                10. Termination
              </Typography>
              <Typography variant="body1" paragraph>
                We reserve the right to terminate or suspend your account and access to the
                Service at our sole discretion, without notice, for conduct that we believe
                violates these Terms or is harmful to other users, us, or third parties, or
                for any other reason.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                11. Changes to Terms
              </Typography>
              <Typography variant="body1" paragraph>
                We reserve the right to modify these Terms at any time. We will provide
                notice of significant changes by posting the new Terms on this page and
                updating the "Last Updated" date. Your continued use of the Service after
                such modifications constitutes acceptance of the updated Terms.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                12. Governing Law
              </Typography>
              <Typography variant="body1" paragraph>
                These Terms shall be governed by and construed in accordance with the laws
                of Israel, without regard to its conflict of law provisions.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                13. Dispute Resolution
              </Typography>
              <Typography variant="body1" paragraph>
                Any disputes arising from these Terms or your use of the Service shall be
                resolved through good faith negotiations. If a resolution cannot be reached,
                disputes shall be subject to the exclusive jurisdiction of the courts in Tel
                Aviv, Israel.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                14. Contact Information
              </Typography>
              <Typography variant="body1" paragraph>
                If you have any questions about these Terms of Service, please contact us:
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

            <Box sx={{ mt: 4, p: 3, bgcolor: "grey.100", borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary">
                By using Wedding Planner Studio, you acknowledge that you have read,
                understood, and agree to be bound by these Terms of Service and our Privacy
                Policy.
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default TermsOfService;
