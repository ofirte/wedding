/**
 * Email Templates Utility
 * Generates HTML email templates for producer invitations in multiple languages
 */

interface InvitationEmailParams {
  inviterName: string;
  invitationUrl: string;
  recipientEmail: string;
}

interface ReminderEmailParams {
  inviterName: string;
  invitationUrl: string;
  daysRemaining: number;
}

/**
 * Get the HTML content for producer invitation email
 */
export const getInvitationEmailHTML = (
  params: InvitationEmailParams,
  language: "en" | "he" = "he"
): string => {
  const { inviterName, invitationUrl, recipientEmail } = params;

  const content = {
    en: {
      title: "WedOne",
      heading: "You're Invited to Join as a Producer!",
      greeting: "Hi,",
      intro: `You've been invited by <strong>${inviterName}</strong> to join WedOne as a <strong>Producer</strong>.`,
      benefitsTitle: "As a Producer, you'll have access to:",
      benefits: [
        "Manage multiple weddings",
        "Advanced task management",
        "Cross-wedding analytics",
        "Producer dashboard",
      ],
      buttonText: "Accept Invitation",
      importantLabel: "Important:",
      importantText: `This invitation expires in 7 days and is valid only for this email address (${recipientEmail}).`,
      fallbackText: "If the button doesn't work, copy and paste this link into your browser:",
      footer: "WedOne - Your Wedding Management Partner",
      disclaimer: "If you didn't expect this invitation, you can safely ignore this email.",
    },
    he: {
      title: "WedOne",
      heading: "הוזמנת להצטרף כמפיק!",
      greeting: "שלום,",
      intro: `הוזמנת על ידי <strong>${inviterName}</strong> להצטרף ל-WedOne כ<strong>מפיק</strong>.`,
      benefitsTitle: "כמפיק, תהיה לך גישה ל:",
      benefits: [
        "ניהול מספר חתונות",
        "ניהול משימות מתקדם",
        "אנליטיקה חוצת חתונות",
        "לוח בקרה למפיקים",
      ],
      buttonText: "קבל הזמנה",
      importantLabel: "חשוב:",
      importantText: `הזמנה זו תפוג תוך 7 ימים ותקפה רק לכתובת אימייל זו (${recipientEmail}).`,
      fallbackText: "אם הכפתור לא עובד, העתק והדבק את הקישור הזה לדפדפן שלך:",
      footer: "WedOne - שותף לניהול החתונה שלך",
      disclaimer: "אם לא ציפית להזמנה זו, אתה יכול להתעלם מאימייל זה בבטחה.",
    },
  };

  const t = content[language];
  const direction = language === "he" ? "rtl" : "ltr";

  return `
<!DOCTYPE html>
<html dir="${direction}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FFF8E7; direction: ${direction};">
  <div style="background: linear-gradient(135deg, #9BBB9B 0%, #7D9D6E 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">${t.title}</h1>
  </div>

  <div style="background: #ffffff; padding: 40px; border: 1px solid #D1E4C4; border-top: none; border-radius: 0 0 10px 10px;">
    <h2 style="color: #7D9D6E; margin-top: 0;">${t.heading}</h2>

    <p>${t.greeting}</p>

    <p>${t.intro}</p>

    <div style="background: #F5EFE0; padding: 20px; border-radius: 8px; border-${language === "he" ? "right" : "left"}: 4px solid #9BBB9B; margin: 25px 0;">
      <h3 style="margin-top: 0; color: #7D9D6E;">${t.benefitsTitle}</h3>
      <ul style="margin: 10px 0; color: #333;">
        ${t.benefits.map((benefit) => `<li>${benefit}</li>`).join("\n        ")}
      </ul>
    </div>

    <div style="text-align: center; margin: 35px 0;">
      <a href="${invitationUrl}"
         style="background: linear-gradient(135deg, #9BBB9B 0%, #7D9D6E 100%);
                color: white;
                padding: 15px 40px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                font-size: 16px;
                display: inline-block;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        ${t.buttonText}
      </a>
    </div>

    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      <strong>${t.importantLabel}</strong> ${t.importantText}
    </p>

    <p style="color: #666; font-size: 14px;">
      ${t.fallbackText}<br>
      <a href="${invitationUrl}" style="color: #7D9D6E; word-break: break-all;">${invitationUrl}</a>
    </p>
  </div>

  <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
    <p>${t.footer}</p>
    <p>${t.disclaimer}</p>
  </div>
</body>
</html>`;
};

/**
 * Get the plain text content for producer invitation email
 */
export const getInvitationEmailText = (
  params: InvitationEmailParams,
  language: "en" | "he" = "he"
): string => {
  const { inviterName, invitationUrl } = params;

  const content = {
    en: {
      greeting: "Hi,",
      intro: `You've been invited by ${inviterName} to join WedOne as a Producer.`,
      benefitsTitle: "As a Producer, you'll have access to:",
      benefits: [
        "- Manage multiple weddings",
        "- Advanced task management",
        "- Cross-wedding analytics",
        "- Producer dashboard",
      ],
      clickText: "Click here to accept your invitation:",
      expiryText: "This invitation expires in 7 days and is valid only for this email address.",
      signature: "---\nWedOne Team",
    },
    he: {
      greeting: "שלום,",
      intro: `הוזמנת על ידי ${inviterName} להצטרף ל-WedOne כמפיק.`,
      benefitsTitle: "כמפיק, תהיה לך גישה ל:",
      benefits: [
        "- ניהול מספר חתונות",
        "- ניהול משימות מתקדם",
        "- אנליטיקה חוצת חתונות",
        "- לוח בקרה למפיקים",
      ],
      clickText: "לחץ כאן כדי לקבל את ההזמנה שלך:",
      expiryText: "הזמנה זו תפוג תוך 7 ימים ותקפה רק לכתובת אימייל זו.",
      signature: "---\nצוות WedOne",
    },
  };

  const t = content[language];

  return `${t.greeting}

${t.intro}

${t.benefitsTitle}
${t.benefits.join("\n")}

${t.clickText}
${invitationUrl}

${t.expiryText}

${t.signature}`;
};

/**
 * Get the HTML content for producer invitation reminder email
 */
export const getReminderEmailHTML = (
  params: ReminderEmailParams,
  language: "en" | "he" = "he"
): string => {
  const { inviterName, invitationUrl, daysRemaining } = params;

  const content = {
    en: {
      title: "WedOne",
      heading: "Reminder: Your Producer Invitation",
      greeting: "Hi,",
      intro: `This is a reminder that <strong>${inviterName}</strong> invited you to join WedOne as a Producer.`,
      urgencyText: `⏰ Your invitation expires in ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""}!`,
      buttonText: "Accept Invitation Now",
      fallbackText: "If the button doesn't work, copy and paste this link into your browser:",
      footer: "WedOne - Your Wedding Management Partner",
    },
    he: {
      title: "WedOne",
      heading: "תזכורת: הזמנת המפיק שלך",
      greeting: "שלום,",
      intro: `זוהי תזכורת ש<strong>${inviterName}</strong> הזמין אותך להצטרף ל-WedOne כמפיק.`,
      urgencyText: `⏰ ההזמנה שלך תפוג בעוד ${daysRemaining} ${daysRemaining === 1 ? "יום" : "ימים"}!`,
      buttonText: "קבל הזמנה עכשיו",
      fallbackText: "אם הכפתור לא עובד, העתק והדבק את הקישור הזה לדפדפן שלך:",
      footer: "WedOne - שותף לניהול החתונה שלך",
    },
  };

  const t = content[language];
  const direction = language === "he" ? "rtl" : "ltr";

  return `
<!DOCTYPE html>
<html dir="${direction}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FFF8E7; direction: ${direction};">
  <div style="background: linear-gradient(135deg, #9BBB9B 0%, #7D9D6E 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">${t.title}</h1>
  </div>

  <div style="background: #ffffff; padding: 40px; border: 1px solid #D1E4C4; border-top: none; border-radius: 0 0 10px 10px;">
    <h2 style="color: #D4B957; margin-top: 0;">${t.heading}</h2>

    <p>${t.greeting}</p>

    <p>${t.intro}</p>

    <div style="background: #F0E5B2; padding: 20px; border-${language === "he" ? "right" : "left"}: 4px solid #D4B957; margin: 25px 0;">
      <p style="margin: 0; color: #B19330;">
        <strong>${t.urgencyText}</strong>
      </p>
    </div>

    <div style="text-align: center; margin: 35px 0;">
      <a href="${invitationUrl}"
         style="background: linear-gradient(135deg, #9BBB9B 0%, #7D9D6E 100%);
                color: white;
                padding: 15px 40px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                font-size: 16px;
                display: inline-block;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        ${t.buttonText}
      </a>
    </div>

    <p style="color: #666; font-size: 14px;">
      ${t.fallbackText}<br>
      <a href="${invitationUrl}" style="color: #7D9D6E; word-break: break-all;">${invitationUrl}</a>
    </p>
  </div>

  <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
    <p>${t.footer}</p>
  </div>
</body>
</html>`;
};

/**
 * Get the plain text content for producer invitation reminder email
 */
export const getReminderEmailText = (
  params: ReminderEmailParams,
  language: "en" | "he" = "he"
): string => {
  const { inviterName, invitationUrl, daysRemaining } = params;

  const content = {
    en: {
      greeting: "Hi,",
      intro: `This is a reminder that ${inviterName} invited you to join WedOne as a Producer.`,
      urgency: `Your invitation expires in ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""}.`,
      clickText: "Click here to accept:",
      signature: "---\nWedOne Team",
    },
    he: {
      greeting: "שלום,",
      intro: `זוהי תזכורת ש-${inviterName} הזמין אותך להצטרף ל-WedOne כמפיק.`,
      urgency: `ההזמנה שלך תפוג בעוד ${daysRemaining} ${daysRemaining === 1 ? "יום" : "ימים"}.`,
      clickText: "לחץ כאן כדי לקבל:",
      signature: "---\nצוות WedOne",
    },
  };

  const t = content[language];

  return `${t.greeting}

${t.intro}

${t.urgency}

${t.clickText}
${invitationUrl}

${t.signature}`;
};

/**
 * Get the email subject for producer invitation
 */
export const getInvitationEmailSubject = (language: "en" | "he" = "he"): string => {
  return language === "he"
    ? "הוזמנת להצטרף ל-WedOne כמפיק"
    : "You're invited to join WedOne as a Producer";
};

/**
 * Get the email subject for producer invitation reminder
 */
export const getReminderEmailSubject = (language: "en" | "he" = "he"): string => {
  return language === "he"
    ? "תזכורת: הזמנת המפיק שלך תפוג בקרוב"
    : "Reminder: Your Producer Invitation Expires Soon";
};
