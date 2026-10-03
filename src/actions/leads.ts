"use server";

import db from '@/db/prisma';
import { z } from 'zod';

const LeadSubmissionSchema = z.object({
  pageId: z.string().min(1, 'Page ID is required'),
  componentId: z.string().min(1, 'Component ID is required'),
  componentType: z.string().min(1, 'Component Type is required'),
  name: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  message: z.string().optional(),
  customData: z.record(z.string(), z.any()).optional(),
  source: z.string().optional(),
  referrer: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

export type SubmitLeadInput = z.infer<typeof LeadSubmissionSchema>;

export async function submitLead(formData: SubmitLeadInput) {
  try {
    const parsed = LeadSubmissionSchema.parse(formData);

    // Make sure the page exists
    const page = await db.page.findUnique({
      where: { id: parsed.pageId },
    });

    if (!page) {
      return { success: false, error: 'Page not found' };
    }

    const lead = await db.lead.create({
      data: {
        pageId: parsed.pageId,
        componentId: parsed.componentId,
        componentType: parsed.componentType,
        name: parsed.name,
        email: parsed.email || null,
        phone: parsed.phone,
        message: parsed.message,
        customData: (parsed.customData || {}) as any,
        source: parsed.source,
        referrer: parsed.referrer,
        utmSource: parsed.utmSource,
        utmMedium: parsed.utmMedium,
        utmCampaign: parsed.utmCampaign,
      },
    });

    return { success: true, leadId: lead.id };
  } catch (error) {
    console.error('Lead submission error:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation failed', details: error.issues };
    }
    return { success: false, error: 'Failed to submit form' };
  }
}
