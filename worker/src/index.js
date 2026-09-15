const cors={
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Headers':'Content-Type, Authorization',
  'Access-Control-Allow-Methods':'GET, OPTIONS'
};

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8',...cors}})}

function normalize(ad){
  return {
    id:ad.id,
    pageName:ad.page_name||'',
    pageId:ad.page_id||'',
    body:(ad.ad_creative_bodies&&ad.ad_creative_bodies[0])||'',
    startDate:ad.ad_delivery_start_time?.slice(0,10)||'',
    endDate:ad.ad_delivery_stop_time?.slice(0,10)||null,
    platforms:(ad.publisher_platforms||[]).map(x=>x.charAt(0)+x.slice(1).toLowerCase()),
    mediaType:ad.media_type||'UNKNOWN',
    status:ad.ad_delivery_stop_time?'INACTIVE':'ACTIVE',
    snapshotUrl:ad.ad_snapshot_url||'',
    country:''
  }
}

export default {
  async fetch(request,env){
    if(request.method==='OPTIONS') return new Response(null,{headers:cors});
    const url=new URL(request.url);
    if(url.pathname==='/health') return json({ok:true,service:'ads-spy-api'});
    if(url.pathname!=='/api/search') return json({error:'Not found'},404);
    if(!env.META_ACCESS_TOKEN) return json({error:'META_ACCESS_TOKEN is not configured'},500);

    const q=url.searchParams.get('q')||'';
    const page=url.searchParams.get('page')||'';
    const country=url.searchParams.get('country')||'GB';
    const status=url.searchParams.get('status')||'ACTIVE';
    const media=url.searchParams.get('media')||'ALL';
    const platform=url.searchParams.get('platform')||'ALL';
    const from=url.searchParams.get('from')||'';
    const to=url.searchParams.get('to')||'';

    const apiVersion=env.META_API_VERSION||'v24.0';
    const endpoint=new URL(`https://graph.facebook.com/${apiVersion}/ads_archive`);
    endpoint.searchParams.set('access_token',env.META_ACCESS_TOKEN);
    endpoint.searchParams.set('ad_reached_countries',JSON.stringify(country==='ALL'?['GB']: [country]));
    endpoint.searchParams.set('ad_active_status',status==='ALL'?'ALL':status);
    endpoint.searchParams.set('fields',[
      'id','page_id','page_name','ad_creative_bodies','ad_delivery_start_time','ad_delivery_stop_time',
      'publisher_platforms','ad_snapshot_url','media_type'
    ].join(','));
    endpoint.searchParams.set('limit','50');
    if(q) endpoint.searchParams.set('search_terms',q);
    if(/^\d+$/.test(page)) endpoint.searchParams.set('search_page_ids',JSON.stringify([page]));
    if(from) endpoint.searchParams.set('ad_delivery_date_min',from);
    if(to) endpoint.searchParams.set('ad_delivery_date_max',to);
    if(media!=='ALL') endpoint.searchParams.set('media_type',media);
    if(platform!=='ALL') endpoint.searchParams.set('publisher_platforms',JSON.stringify([platform]));

    const r=await fetch(endpoint.toString());
    const payload=await r.json();
    if(!r.ok) return json({error:'Meta API error',details:payload},r.status);

    let data=(payload.data||[]).map(normalize);
    if(page && !/^\d+$/.test(page)) data=data.filter(x=>x.pageName.toLowerCase().includes(page.toLowerCase()));
    return json({data,paging:payload.paging||null});
  }
}
