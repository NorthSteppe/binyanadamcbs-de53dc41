/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Binyan CBS'
const LOGO_URL = 'https://wcqjmjceelcainyyqjmi.supabase.co/storage/v1/object/public/email-assets/binyan-logo.png?v=1'
const SITE_URL = 'https://bacbs.com'

interface NotificationEmailProps {
  title?: string
  message?: string
  link?: string
}

const NotificationEmail = ({ title, message, link }: NotificationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{title || 'You have a new notification'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src={LOGO_URL}
          alt="Binyan"
          width="120"
          style={{ marginBottom: '24px' }}
        />
        <Heading style={h1}>{title || 'New Notification'}</Heading>
        <Text style={text}>{message || 'You have a new notification on Binyan CBS.'}</Text>
        {link && (
          <Button style={button} href={`${SITE_URL}${link}`}>
            View Details
          </Button>
        )}
        <Text style={footer}>
          — The {SITE_NAME} Team
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: NotificationEmail,
  subject: (data: Record<string, any>) => data.title || 'New Notification',
  displayName: 'Notification',
  previewData: {
    title: 'New Session Scheduled',
    message: 'Your session "Initial Assessment" has been scheduled for 15 Jan 2026 at 10:00.',
    link: '/portal/booking',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'DM Sans', Arial, sans-serif" }
const container = { padding: '32px 28px' }
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: 'hsl(192, 35%, 18%)',
  margin: '0 0 20px',
}
const text = {
  fontSize: '15px',
  color: 'hsl(192, 15%, 46%)',
  lineHeight: '1.6',
  margin: '0 0 28px',
}
const button = {
  backgroundColor: 'hsl(174, 42%, 32%)',
  color: '#ffffff',
  fontSize: '15px',
  borderRadius: '12px',
  padding: '14px 24px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 0' }
