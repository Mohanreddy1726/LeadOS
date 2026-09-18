import Lead from './models/Lead';
import dbConnect from './db';
import { logMetaSync } from './logger';

interface MetaConfig {
  appId: string;
  appSecret: string;
  adAccountId: string;
  pageToken: string;
}

const getConfig = (): MetaConfig => {
  const config = {
    appId: process.env.META_APP_ID || '',
    appSecret: process.env.META_APP_SECRET || '',
    adAccountId: process.env.META_AD_ACCOUNT_ID || '',
    pageToken: process.env.META_PAGE_ACCESS_TOKEN || '',
  };

  const missing = Object.entries(config)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing Meta configuration environment variables: ${missing.join(', ')}`);
  }

  return config;
};

async function fetchAllPages(url: string) {
  let allData: any[] = [];
  let nextUrl = url;

  while (nextUrl) {
    await logMetaSync(`Fetching Meta API: ${nextUrl}`);
    const response = await fetch(nextUrl);
    if (!response.ok) {
      const errText = await response.text();
      await logMetaSync(`Meta API Error Response: ${errText}`, 'ERROR');
      throw new Error(`Meta API error: ${response.statusText} - ${errText}`);
    }
    const result = await response.json();
    await logMetaSync(`Received ${result.data?.length || 0} items from page.`);

    if (result.data && Array.isArray(result.data)) {
      allData.push(...result.data);
    }

    nextUrl = result.paging?.next || null;
  }

  return allData;
}

export async function fetchPageDetails() {
  const { pageToken } = getConfig();
  const url = `https://graph.facebook.com/v19.0/me/accounts?access_token=${pageToken}`;
  await logMetaSync(`Fetching Page details from: ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    const errText = await response.text();
    await logMetaSync(`Failed to fetch Page details. Status: ${response.status}, Body: ${errText}`, 'ERROR');
    throw new Error(`Failed to fetch Page details: ${response.statusText}`);
  }
  const result = await response.json();
  if (result.data && result.data.length > 0) {
    return {
      id: result.data[0].id,
      accessToken: result.data[0].access_token
    };
  }
  throw new Error('No associated Facebook Page found for this token.');
}

export async function fetchMetaLeadsList() {
  const { adAccountId, pageToken } = getConfig();

  try {
    const { id: pageId, accessToken: pageAccessToken } = await fetchPageDetails();
    await logMetaSync(`Using Page ID ${pageId} and Page Access Token for lead retrieval.`);

    // Step 1: Fetch all Leadgen Forms for the page
    const formsUrl = `https://graph.facebook.com/v19.0/${pageId}/leadgen_forms?access_token=${pageAccessToken}&fields=id,name`;
    await logMetaSync(`Fetching forms from: ${formsUrl}`);
    const formsRes = await fetch(formsUrl);

    if (!formsRes.ok) {
      const errText = await formsRes.text();
      await logMetaSync(`Failed to fetch leadgen forms. Status: ${formsRes.status}, Body: ${errText}`, 'ERROR');
      throw new Error(`Failed to fetch leadgen forms: ${formsRes.statusText}`);
    }

    const formsData = await formsRes.json();
    await logMetaSync(`Forms response received: ${JSON.stringify(formsData)}`);

    if (!formsData.data || formsData.data.length === 0) {
      await logMetaSync(`No leadgen forms found for Page ${pageId}. Please check if forms are created and the token has leads_retrieval permission.`, 'WARN');
      return { leads: [], pageAccessToken };
    }

    await logMetaSync(`Found ${formsData.data.length} leadgen forms. Fetching leads for each...`);

    // Step 2: Fetch leads for each form and combine them
    let allLeads = [];
    for (const form of formsData.data) {
      const leadsUrl = `https://graph.facebook.com/v19.0/${form.id}/leads?access_token=${pageAccessToken}&fields=id,created_time&limit=100`;
      await logMetaSync(`Fetching leads for form ${form.id} (${form.name})`);
      const leadsRes = await fetch(leadsUrl);
      if (leadsRes.ok) {
        const leadsData = await leadsRes.json();
        if (leadsData.data) {
          await logMetaSync(`Found ${leadsData.data.length} leads in form ${form.id}`);
          allLeads.push(...leadsData.data);
        }
      } else {
        const errText = await leadsRes.text();
        await logMetaSync(`Failed to fetch leads for form ${form.id}: ${leadsRes.status} - ${errText}`, 'ERROR');
      }
    }

    return { leads: allLeads, pageAccessToken };
  } catch (err) {
    await logMetaSync(`Lead retrieval failed critical error: ${err}`, 'ERROR');
    throw err;
  }
}

export async function fetchMetaLeadData(leadgenId: string, accessToken: string) {
  const url = `https://graph.facebook.com/v19.0/${leadgenId}?access_token=${accessToken}&fields=field_data,campaign_id,adset_id,ad_id`;

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
    const { leads: leadsList, pageAccessToken } = await fetchMetaLeadsList();
    await logMetaSync(`Found ${leadsList.length} leads to sync from Meta...`);

    let processedCount = 0;
    for (const lead of leadsList) {
      try {
        const leadData = await fetchMetaLeadData(lead.id, pageAccessToken);
        await processMetaLead(leadData);
        processedCount++;
      } catch (err) {
        await logMetaSync(`Failed to sync lead ${lead.id}: ${err}`, 'ERROR');
      }
    }

    await logMetaSync(`Successfully synced ${processedCount} leads.`);
    return processedCount;
  } catch (err) {
    await logMetaSync(`Meta Lead Sync Error: ${err}`, 'ERROR');
    throw err;
  }
}

export async function processMetaLead(leadData: any) {
  await dbConnect();

  // Meta lead data comes as an array of field_data: [{name: 'full_name', values: ['John Doe']}, ...]
  const fields: Record<string, any> = {};
  if (Array.isArray(leadData.field_data)) {
    leadData.field_data.forEach((field: any) => {
      if (field.name && Array.isArray(field.values) && field.values.length > 0) {
        fields[field.name] = field.values[0];
      }
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
    metaLeadId: leadData.id,
  };

  // Use metaLeadId for duplicate checking instead of _id
  return Lead.findOneAndUpdate(
    { metaLeadId: leadData.id },
    mappedData,
    { upsert: true, new: true }
  );
}
