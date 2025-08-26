import { Resend } from 'resend';
import { env } from '../env';

const resend = new Resend(env.RESEND_API_KEY);

interface SendInvitationEmailParams {
  to: string;
  inviterName: string;
  teamName: string;
  invitationLink: string;
  expiresAt: Date;
}

export async function sendInvitationEmail({
  to,
  inviterName,
  teamName,
  invitationLink,
  expiresAt,
}: SendInvitationEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: `SmartCollab <invites@${env.EMAIL_DOMAIN}>`,
      to: [to],
      subject: `You've been invited to join ${teamName} on SmartCollab`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>You're invited to join ${teamName}</h1>
          <p>${inviterName} has invited you to join the <strong>${teamName}</strong> team on SmartCollab.</p>
          <p>Click the button below to accept the invitation:</p>
          <div style="margin: 2rem 0;">
            <a href="${invitationLink}" 
               style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Accept Invitation
            </a>
          </div>
          <p style="color: #6b7280; font-size: 0.875rem;">
            This invitation will expire on ${expiresAt.toLocaleDateString()} at ${expiresAt.toLocaleTimeString()}.
          </p>
          <p style="color: #6b7280; font-size: 0.875rem; margin-top: 2rem;">
            If you didn't expect to receive this invitation, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending invitation email:', error);
      throw new Error('Failed to send invitation email');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in sendInvitationEmail:', error);
    throw error;
  }
}
