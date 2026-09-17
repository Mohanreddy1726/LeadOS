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

async function fetchAllPages(url: string) {
  let allData: any[] = [];
  let nextUrl = url;

  while (nextUrl) {
    const response = await fetch(nextUrl);
    if (!response.ok) throw new Error(`Meta API error: ${response.statusText}`);
    const result = await response.json();

    if (result.data && Array.isArray(result.data)) {
      allData.push(...result.data);
    }

    nextUrl = result.paging?.next || null;
  }

  return allData;
}

export async function fetchMetaLeadsList() {
  const { adAccountId, pageToken } = getConfig();
  const url = `https://graph.facebook.com/v19.0/act_${adAccountId}/leads?access_token=${pageToken}&fields=id,created_time`;

  return fetchAllPages(url);
}

export async function fetchMetaLeadData(leadgenId: string) {
  const { pageToken } = getConfig();
  const url = `https://graph.facebook.com/v19.0/${leadgenId}?access_token=${pageToken}&fields=field_data,campaign_id,adset_id,ad_id`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Meta API error: ${response.statusText}`);

  return response.json();
}

export async function syncCampaignPerformance() {
  const { adAccountId, pageToken } = getConfig();
  const url = `https://graph.facebook.com/v19.0/act_${adAccountId}/insights?fields=campaign_id,campaign_name,spend,impressions,clicks,conversions,reach,actions&level=campaign&date_preset=maximum&access_token=${pageToken}`;

  return fetchAllPages(url);
}

export async function syncAdSetPerformance() {
  const { adAccountId, pageToken } = getConfig();
  const url = `https://graph.facebook.com/v19.0/act_${adAccountId}/insights?fields=adset_id,adset_name,campaign_id,spend,impressions,clicks,conversions,reach,actions&level=adset&date_preset=maximum&access_token=${pageToken}`;

  return fetchAllPages(url);
}

export async function syncAdPerformance() {
  const { adAccountId, pageToken } = getConfig();
  const url = `https://graph.facebook.com/v19.0/act_${adAccountId}/insights?fields=ad_id,ad_name,adset_id,campaign_id,spend,impressions,clicks,conversions,reach,actions&level=ad&date_preset=maximum&access_token=${pageToken}`;

  return fetchAllPages(url);
}

export async function fetchMetaCampaignStatus() {
  const { adAccountId, pageToken } = getConfig();
  const url = `https://graph.facebook.com/v19.0/act_${adAccountId}/campaigns?fields=id,status,name&access_token=${pageToken}`;

  return fetchAllPages(url);
}

export async function fetchMetaAdSetStatus() {
  const { adAccountId, pageToken } = getConfig();
  const url = `https://graph.facebook.com/v19.0/act_${adAccountId}/adsets?fields=id,status,name&access_token=${pageToken}`;

  return fetchAllPages(url);
}

export async function fetchMetaAdStatus() {
  const { adAccountId, pageToken } = getConfig();
  const url = `https://graph.facebook.com/v19.0/act_${adAccountId}/ads?fields=id,status,name&access_token=${pageToken}`;

  return fetchAllPages(url);
}

export async function syncMetaLeads() {
  try {
    const leadsList = await fetchMetaLeadsList();
    console.log(`Found ${leadsList.length} leads to sync from Meta...`);

    let processedCount = 0;
    for (const lead of leadsList) {
      try {
        const leadData = await fetchMetaLeadData(lead.id);
        await processMetaLead(leadData);
        processedCount++;
      } catch (err) {
        console.error(`Failed to sync lead ${lead.id}:`, err);
      }
    }

    console.log(`Successfully synced ${processedCount} leads.`);
    return processedCount;
  } catch (err) {
    console.error('Meta Lead Sync Error:', err);
    throw err;
  }
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
    city: fields['city'] || '',
    neetQualified: fields['neet_qualified'] || fields['neet_qualified_status'] || '',
    source: 'Meta Ads',
    stage: 'New',
    metaCampaignId: leadData.campaign_id,
    metaAdSetId: leadData.adset_id,
    metaAdId: leadData.ad_id,
    campaignId: leadData.campaign_id || leadData.ad_id,
    createdAt: new Date(leadData.created_time || Date.now()),
  };

  // Use Meta Lead ID to avoid duplicates
  return Lead.findOneAndUpdate(
    { _id: leadData.id },
    mappedData,
    { upsert: true, new: true }
  );
}
