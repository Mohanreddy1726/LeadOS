import Lead from './models/Lead';
import dbConnect from './db';

interface MetaConfig {
  appId: string;
  appSecret: string;
  adAccountId: string;
  pageToken: string;
}

const getConfig = (): MetaConfig => ({
  appId: process.env.META_APP_ID || '',
  appSecret: process.env.META_APP_SECRET || '',
  adAccountId: process.env.META_AD_ACCOUNT_ID || '',
  pageToken: process.env.META_PAGE_ACCESS_TOKEN || '',
});

export async function fetchMetaLeadData(leadgenId: string) {
  const { pageToken } = getConfig();
  const url = `https://graph.facebook.com/v19.0/${leadgenId}?access_token=${pageToken}&fields=field_data`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Meta API error: ${response.statusText}`);

  return response.json();
}

export async function syncCampaignPerformance() {
  const { adAccountId, pageToken } = getConfig();
  const url = `https://graph.facebook.com/v19.0/act_${adAccountId}/insights?fields=campaign_id,campaign_name,spend,impressions,clicks,conversions,reach&level=campaign&date_preset=maximum&access_token=${pageToken}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Meta Insights API error: ${response.statusText}`);

  return response.json();
}

export async function syncAdSetPerformance() {
  const { adAccountId, pageToken } = getConfig();
  const url = `https://graph.facebook.com/v19.0/act_${adAccountId}/insights?fields=adset_id,adset_name,campaign_id,spend,impressions,clicks,conversions,reach&level=adset&date_preset=maximum&access_token=${pageToken}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Meta Insights API error: ${response.statusText}`);

  return response.json();
}

export async function syncAdPerformance() {
  const { adAccountId, pageToken } = getConfig();
  const url = `https://graph.facebook.com/v19.0/act_${adAccountId}/insights?fields=ad_id,ad_name,adset_id,campaign_id,spend,impressions,clicks,conversions,reach&level=ad&date_preset=maximum&access_token=${pageToken}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Meta Insights API error: ${response.statusText}`);

  return response.json();
}

export async function fetchMetaCampaignStatus() {
  const { adAccountId, pageToken } = getConfig();
  const url = `https://graph.facebook.com/v19.0/act_${adAccountId}/campaigns?fields=id,status&access_token=${pageToken}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Meta Campaigns API error: ${response.statusText}`);

  return response.json();
}

export async function fetchMetaAdSetStatus() {
  const { adAccountId, pageToken } = getConfig();
  const url = `https://graph.facebook.com/v19.0/act_${adAccountId}/adsets?fields=id,status&access_token=${pageToken}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Meta AdSet API error: ${response.statusText}`);

  return response.json();
}

export async function fetchMetaAdStatus() {
  const { adAccountId, pageToken } = getConfig();
  const url = `https://graph.facebook.com/v19.0/act_${adAccountId}/ads?fields=id,status&access_token=${pageToken}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Meta Ad API error: ${response.statusText}`);

  return response.json();
}

export async function processMetaLead(leadData: any) {
  await dbConnect();

  // Meta lead data comes as an array of field_data: [{name: 'full_name', values: ['John Doe']}, ...]
  const fields: Record<string, any> = {};
  if (Array.isArray(leadData.field_data)) {
    leadData.field_data.forEach((field: any) => {
      fields[field.name] = field.values[0];
    });
  }

  const mappedData = {
    name: fields['full_name'] || fields['first_name'] || 'Unknown Meta Lead',
    phone: fields['phone_number'] || '',
    email: fields['email'] || '',
    program: fields['program'] || 'Meta Ads',
    destination: fields['country'] || 'Not Specified',
    source: 'Meta Ads',
    stage: 'New',
    createdAt: new Date(),
  };

  const newLead = new Lead(mappedData);
  await newLead.save();
  return newLead;
}
