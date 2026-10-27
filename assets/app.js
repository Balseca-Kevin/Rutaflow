'use strict';
/* Proyecto académico: autenticación simulada y datos guardados localmente. */
const STORAGE_KEY = 'rutaflow_buses_solicitudes_formularios_v5'; // Mantener registros de la versión anterior
const SESSION_KEY = 'rutaflow_buses_sesion_v5';
const USERS = Object.freeze({
  desarrollador: { password: 'dev123', role: 'desarrollador', name: 'Equipo de desarrollo', label: 'Desarrollador', avatar: 'D' },
  comite: { password: 'comite123', role: 'comite', name: 'Comité de Cambios', label: 'Comité de aprobación', avatar: 'C' },
});
const STATUS = { pendiente: { label:'Pendiente', cls:'solicitada' }, aprobada: { label:'Aprobada', cls:'aprobada' }, rechazada: { label:'Rechazada', cls:'rechazada' } };
const $ = id => document.getElementById(id);
const esc = x => String(x ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const valueOf = (form, key) => String(new FormData(form).get(key) ?? '').trim();
const dateOf = d => { let a = new Date(d); return isNaN(a.getTime()) ? 'Sin fecha' : a.toLocaleString('es-EC',{dateStyle:'medium',timeStyle:'short'}); };
const brief = (text,n=83) => {let s=String(text||'');return s.length>n ? s.slice(0,n-1)+'…':s;};
const info = (label,data,wide=false) => `<div class="info-block ${wide?'wide':''}"><label>${esc(label)}</label><p class="${wide?'card-text':''}">${esc(data || 'No registrado')}</p></div>`;
const badge = state => `<span class="status-pill pill-${STATUS[state]?.cls || 'solicitada'}">${STATUS[state]?.label || 'Pendiente'}</span>`;
const tomorrowless = days => {const d=new Date();d.setDate(d.getDate()-days);return d.toISOString();};
const demoRequests = () => [
  {id:'RF-0002',origin:'desarrollador',requester:'Equipo de desarrollo',requesterRole:'Backend',contact:'',module:'Pasarela de pagos y comprobantes',description:'Corregir la validación del estado de pago antes de generar el comprobante de un viaje.',impactRisk:'Se podrían duplicar comprobantes al reintentar pagos. Afecta la API de pagos y la confirmación de reservas.',priority:'Alta',effortHours:'10',changeType:'Bug / Error',originType:'Incidencia',traceability:'INC-24 · fix/comprobante-duplicado',testsPerformed:'Sí',testNotes:'Prueba del reintento de pago e idempotencia de comprobantes.',reference:'INC-24',createdAt:tomorrowless(1),status:'pendiente',decision:null,attachment:null},
  {id:'RF-0001',origin:'pasajero',requester:'María López',contact:'maria.ejemplo@example.com',requesterRole:'Pasajero',module:'Asientos y disponibilidad',reference:'Ambato – Quito',description:'Permitir cambiar el asiento seleccionado antes de confirmar la compra del pasaje.',reason:'Actualmente es necesario reiniciar la reserva al equivocarse de asiento.',priority:'Media',changeType:'Reservas y asientos',originType:'Solicitud de mejora',createdAt:tomorrowless(2),status:'pendiente',decision:null,attachment:null}
];
function loadRequests() {
  try {const raw=localStorage.getItem(STORAGE_KEY);if(raw===null){const examples=demoRequests();localStorage.setItem(STORAGE_KEY,JSON.stringify(examples));return examples;}const parsed=JSON.parse(raw);return Array.isArray(parsed)?parsed.filter(r=>r&&typeof r.id==='string'&&STATUS[r.status]):demoRequests();}
  catch(err){console.warn('Sin almacenamiento local',err);return demoRequests();}
}
let requests=loadRequests();
const state={account:null,selectedId:null,search:'',filter:'all',priorityFilter:'all',functionalFilter:'all',toastTimer:null};
function save(next) {try{localStorage.setItem(STORAGE_KEY,JSON.stringify(next));requests=next;return true;}catch(err){console.error(err);notify('No fue posible guardar. Verifica el espacio disponible del navegador.',true);return false;}}
function notify(message,isError=false){const node=$('toast');node.textContent=message;node.classList.toggle('bad',isError);node.hidden=false;clearTimeout(state.toastTimer);state.toastTimer=setTimeout(()=>node.hidden=true,4600);}
function nextId(){let max=requests.reduce((n,r)=>Math.max(n,Number(/^RF-(\d+)$/.exec(r.id)?.[1]||0)),0);return 'RF-'+String(max+1).padStart(4,'0');}
function stamp(){const today=new Date().toLocaleDateString('es-EC',{day:'2-digit',month:'2-digit',year:'numeric'});$('guestDate').textContent=today;$('devDate').textContent=today;$('guestPreviewId').textContent=nextId();$('devPreviewId').textContent=nextId();}
function sessionAs(role){state.account=role==='pasajero'?{role:'pasajero',name:'Visitante',label:'Pasajero · Sin cuenta',avatar:'P'}:{...USERS[role],username:role};$('entryScreen').hidden=true;$('appScreen').hidden=false;try{if(role==='pasajero')sessionStorage.removeItem(SESSION_KEY);else sessionStorage.setItem(SESSION_KEY,role);}catch(err){}showApp();}
function logout(){state.account=null;try{sessionStorage.removeItem(SESSION_KEY);}catch(err){}$('appScreen').hidden=true;$('entryScreen').hidden=false;$('loginPassword').value='';$('loginError').hidden=true;$('submissionResult').hidden=true;window.scrollTo(0,0);}
function showApp(){const a=state.account;if(!a)return;$('passengerView').hidden=a.role!=='pasajero';$('developerView').hidden=a.role!=='desarrollador';$('committeeView').hidden=a.role!=='comite';$('submissionResult').hidden=true;
 $('sidebarUser').textContent=a.name;$('sidebarRole').textContent=a.label;$('roleAvatar').textContent=a.avatar;$('roleAvatar').className='role-avatar '+(a.role==='pasajero'?'user-avatar':a.role==='desarrollador'?'expert-avatar':'committee-avatar');$('topUser').textContent=a.label;$('headingChip').textContent=a.role==='pasajero'?'PASAJERO':a.role==='desarrollador'?'DESARROLLADOR':'COMITÉ';$('menuName').textContent=a.role==='comite'?'Reportes de cambio':'Nueva solicitud';$('breadcrumbCurrent').textContent=a.role==='comite'?'Reportes':'Solicitud de cambio';$('roleEyebrow').textContent=a.role==='comite'?'APROBACIÓN DE CAMBIOS':'REGISTRO DE SOLICITUDES';
 const descriptor=a.role==='pasajero'?['Solicitud de cambio · Pasajero','Describe un problema o una mejora en el sistema de reservas de buses.','Puedes solicitar un cambio sin registrarte ni iniciar sesión.']:a.role==='desarrollador'?['Solicitud de cambio · Desarrollador','Documenta la información técnica necesaria para evaluar tu propuesta.','Tu solicitud técnica será revisada por el comité de cambios.']:['Comité de aprobación','Revisa reportes prellenados y aprueba o rechaza cada solicitud.','El comité emite una decisión final y su correspondiente justificación.'];$('pageTitle').textContent=descriptor[0];$('pageSubtitle').textContent=descriptor[1];$('roleGuidance').textContent=descriptor[2];
 stamp();if(a.role==='comite'){state.selectedId=requests.find(r=>r.status==='pendiente')?.id||requests[0]?.id||null;state.search='';state.filter='all';state.priorityFilter='all';state.functionalFilter='all';$('searchInput').value='';$('statusFilter').value='all';$('priorityFilter').value='all';$('functionalFilter').value='all';renderCommittee();}window.scrollTo(0,0);}
const mimeAllow=new Set(['image/png','image/jpeg','image/webp','application/pdf','text/plain','application/json','application/javascript','text/javascript','text/markdown','application/octet-stream']);
async function fileOf(input){const file=input?.files?.[0];if(!file)return null;if(file.size>700*1024)throw Error('El adjunto no puede superar 700 KB.');const extension=(file.name.split('.').pop()||'').toLowerCase();if(!['png','jpg','jpeg','webp','pdf','txt','log','json','js','ts','md'].includes(extension))throw Error('Formato no permitido. Sube una imagen, PDF, texto, log o archivo de código.');if(file.type&&!mimeAllow.has(file.type))throw Error('El archivo no es de un tipo admitido.');const data=await new Promise((resolve,reject)=>{const fr=new FileReader();fr.onload=()=>resolve(String(fr.result));fr.onerror=()=>reject(new Error('No se pudo leer el archivo adjunto.'));fr.readAsDataURL(file);});return{name:file.name,size:file.size,type:file.type,data};}
async function sendRequest(event, origin) {
  event.preventDefault();
  if(state.account?.role!==origin)return;
  const form=event.currentTarget;
  if(!form.reportValidity())return;
  const keys=origin==='pasajero'
    ? ['requester','contact','requesterRole','module','description','reason','benefits','nonImplementation','reference','priority','changeType','originType']
    : ['requester','contact','developerArea','module','description','reason','benefits','nonImplementation','businessAreas','affectedCIs','impactRisk','priority','effortHours','costUSD','resources','proposedSchedule','mitigation','implementationPlan','rollbackPlan','changeType','originType','traceability','testsPerformed','testNotes'];
  const obj={};for(const key of keys)obj[key]=valueOf(form,key);
  if(origin==='pasajero'&&(!obj.requester||!obj.contact||!obj.requesterRole||!obj.module||obj.description.length<12||obj.reason.length<10||obj.benefits.length<8||obj.nonImplementation.length<8||!obj.priority||!obj.changeType||!obj.originType)){
    notify('Completa los campos obligatorios de la solicitud de pasajero.',true);return;
  }
  if(origin==='desarrollador'&&(!obj.requester||!obj.contact||!obj.developerArea||!obj.module||obj.description.length<12||obj.reason.length<10||obj.benefits.length<8||obj.nonImplementation.length<8||!obj.businessAreas||!obj.affectedCIs||obj.impactRisk.length<10||!obj.priority||!obj.changeType||!obj.originType||!obj.traceability||!obj.testsPerformed||!(Number(obj.effortHours)>0)||obj.costUSD===''||Number(obj.costUSD)<0||!obj.resources||obj.mitigation.length<8||obj.implementationPlan.length<12||obj.rollbackPlan.length<12)){
    notify('Completa la identificación, justificación, evaluación y planes técnicos obligatorios.',true);return;
  }
  const submit=form.querySelector('[type=submit]');submit.disabled=true;submit.textContent='Guardando...';
  try{
    obj.attachment=await fileOf(form.querySelector('[name=attachment]'));
    const id=nextId();const date=new Date().toISOString();
    const req={id,origin,...obj,createdAt:date,status:'pendiente',decision:null,
      audit:[{action:'Solicitud RFC registrada',at:date,actor:obj.requester}]};
    if(!save([req,...requests]))return;
    form.reset();stamp();
    $('submissionResult').hidden=false;
    $('submissionTitle').textContent=`Solicitud ${id} registrada`;
    $('submissionText').textContent='Tu solicitud tiene ID y fecha de registro. El comité debe completar su evaluación y registrar la decisión. Esta solicitud aún NO autoriza cambios en producción.';
    notify('RFC '+id+' registrada.');$('submissionResult').scrollIntoView({block:'nearest',behavior:'smooth'});
  }catch(err){notify(err.message||'No se pudo procesar el adjunto.',true);}
  finally{submit.disabled=false;submit.textContent=origin==='pasajero'?'Enviar solicitud →':'Enviar solicitud técnica →';}
}
const priorityRank=p=>({Urgente:0,'Crítica':0,Alta:1,Media:2,Baja:3}[p]??4);
function filtered(){return requests.filter(r=>
 (state.filter==='all'||r.status===state.filter)&&
 (state.priorityFilter==='all'||(state.priorityFilter==='Urgente' ? ['Urgente','Crítica'].includes(r.priority) : r.priority===state.priorityFilter))&&
 (state.functionalFilter==='all'||r.changeType===state.functionalFilter)&&
 [r.id,r.requester,r.module,r.description,r.changeType,r.originType,r.traceability].some(v=>String(v||'').toLocaleLowerCase('es').includes(state.search))
 ).sort((a,b)=>(a.status==='pendiente'?0:1)-(b.status==='pendiente'?0:1)||priorityRank(a.review?.assignedPriority||a.priority)-priorityRank(b.review?.assignedPriority||b.priority)||new Date(b.createdAt)-new Date(a.createdAt));}
function renderFunctionalTypes(){const sel=$('functionalFilter'),values=[...new Set(requests.map(r=>r.changeType).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));sel.innerHTML='<option value="all">Todos los tipos funcionales</option>'+values.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');sel.value=values.includes(state.functionalFilter)?state.functionalFilter:'all';}
function renderStats(){const values=[['Total de reportes',requests.length,'▣'],['Pendientes',requests.filter(r=>r.status==='pendiente').length,'◷'],['Aprobados',requests.filter(r=>r.status==='aprobada').length,'✓'],['Rechazados',requests.filter(r=>r.status==='rechazada').length,'✕']];$('stats').innerHTML=values.map(([label,count,symbol])=>`<article class="stat-card"><div class="stat-top"><span class="stat-label">${label}</span><span class="stat-symbol">${symbol}</span></div><div class="stat-value">${count}</div></article>`).join('');}
function renderList(){const listed=filtered();$('listCount').textContent=listed.length;$('requestList').innerHTML=listed.length?listed.map(r=>`<button type="button" class="ticket ${r.id===state.selectedId?'selected':''}" data-request-id="${esc(r.id)}" aria-pressed="${r.id===state.selectedId}"><div class="ticket-top"><span class="ticket-id">${esc(r.id)} · ${r.origin==='pasajero'?'PASAJERO':'DESARROLLADOR'}</span>${badge(r.status)}</div><div class="ticket-title">${esc(brief(r.description,110))}</div><div class="ticket-bottom"><span class="ticket-module">${esc(r.module)} · Prioridad ${esc(r.review?.assignedPriority||r.priority||'No registrada')} · ${esc(r.changeType||'Sin tipo')}</span><span>${esc(dateOf(r.createdAt))}</span></div></button>`).join(''):'<div class="empty-list">No hay reportes para este filtro.</div>';}
const inputField=(label,name,value='',options={})=>{
  const attrs=`id="review_${esc(name)}" name="${esc(name)}" ${options.hint?`aria-describedby="hint_${esc(name)}"`:''}`;
  const required=options.required?'<span class="review-required"> *</span>':'';
  let control;
  if(options.values){control=`<select ${attrs}><option value="">Selecciona una opción</option>${options.values.map(([key,text])=>`<option value="${esc(key)}" ${String(value)===key?'selected':''}>${esc(text)}</option>`).join('')}</select>`;}
  else if(options.multiline){control=`<textarea ${attrs} rows="${options.rows||3}" maxlength="${options.max||1800}" placeholder="${esc(options.placeholder||'')}" >${esc(value)}</textarea>`;}
  else{control=`<input ${attrs} type="${esc(options.type||'text')}" ${options.type==='number'?'min="0" step="0.01"':''} maxlength="${options.max||320}" value="${esc(value)}" placeholder="${esc(options.placeholder||'')}">`;}
  return `<div class="field ${options.wide?'wide':''}"><label for="review_${esc(name)}">${esc(label)}${required}</label>${control}${options.hint?`<small id="hint_${esc(name)}">${esc(options.hint)}</small>`:''}</div>`;
};
const prior=(priority)=>priority==='Crítica'?'Urgente':priority||'';
const reviewTypeOptions=[['normal','Normal · Evaluación y autorización'],['estandar','Estándar · Bajo riesgo y preautorizado'],['emergencia','Emergencia · Acción inmediata']];
function reviewFields(r){
 const priorityOptions=['Urgente','Alta','Media','Baja'].map(x=>[x,x]);
 const budgetOptions=[['aprobado','Presupuesto asignado/aprobado'],['no_requerido','Sin presupuesto adicional'],['pendiente','Presupuesto pendiente de aprobación']];
 const cost=r.costUSD??'';
 return `<div class="review-note">Los datos del solicitante son inalterables. El comité documenta el caso de negocio, riesgo, costos, recursos y los planes antes de autorizar. <b>Los cambios estándar deben tener autorización previa verificable.</b></div>
 <h4>A · Identificación, prioridad y clasificación ITIL</h4>
 <div class="review-grid">
 ${inputField('Propietario del cambio','changeOwner',r.review?.changeOwner||'',{required:true,placeholder:'Responsable designado del cambio'})}
 ${inputField('Prioridad asignada por el comité','assignedPriority',r.review?.assignedPriority||prior(r.priority),{required:true,values:priorityOptions,hint:'Puede diferir de la prioridad propuesta.'})}
 ${inputField('Clasificación ITIL','itilClass',r.review?.itilClass||'',{required:true,values:reviewTypeOptions,hint:'Independiente del tipo funcional: pagos, reservas, seguridad, etc.'})}
 ${inputField('Autorización previa del cambio estándar','preauthReference',r.review?.preauthReference||'',{placeholder:'Código del procedimiento previamente aprobado'})}
 ${inputField('Motivo de emergencia','emergencyReason',r.review?.emergencyReason||'',{wide:true,placeholder:'Solo si se clasifica como emergencia: por qué requiere atención inmediata'})}
 </div>
 <h4>B · Justificación y caso de negocio</h4>
 <div class="review-grid">
 ${inputField('Razón de la solicitud','businessReason',r.review?.businessReason||r.reason||'',{required:true,multiline:true,wide:true})}
 ${inputField('Beneficios esperados','benefits',r.review?.benefits||r.benefits||'',{required:true,multiline:true})}
 ${inputField('Consecuencias si no se implementa','nonImplementation',r.review?.nonImplementation||r.nonImplementation||'',{required:true,multiline:true})}
 </div>
 <h4>C · Impacto, servicios y elementos afectados</h4>
 <div class="review-grid">
 ${inputField('Procesos/áreas del negocio afectados','businessAreas',r.review?.businessAreas||r.businessAreas||'',{required:true,placeholder:'Ej. Ventas y atención al cliente'})}
 ${inputField('Servicio afectado','affectedServices',r.review?.affectedServices||r.module||'',{required:true})}
 ${inputField('CI / componentes de configuración afectados','affectedCIs',r.review?.affectedCIs||r.affectedCIs||'',{required:true,placeholder:'Ej. Servicio reservas, base de datos, API pagos'})}
 ${inputField('Impacto técnico, operativo o de negocio','impact',r.review?.impact||r.impactRisk||'',{required:true,multiline:true})}
 </div>
 <h4>D · Riesgos, mitigación y reversión</h4>
 <div class="review-grid">
 ${inputField('Riesgos identificados','risks',r.review?.risks||r.impactRisk||'',{required:true,multiline:true})}
 ${inputField('Contramedidas y mitigación','mitigation',r.review?.mitigation||r.mitigation||'',{required:true,multiline:true})}
 ${inputField('Plan de reversión / rollback','rollbackPlan',r.review?.rollbackPlan||r.rollbackPlan||'',{required:true,multiline:true,wide:true,hint:'Acciones verificables para restaurar reservas, pagos y disponibilidad de asientos si falla el cambio.'})}
 </div>
 <h4>E · Planificación, recursos y presupuesto</h4>
 <div class="review-grid">
 ${inputField('Plan de implementación','implementationPlan',r.review?.implementationPlan||r.implementationPlan||'',{required:true,multiline:true,wide:true,hint:'Debe quedar establecido ANTES de aprobar. La aplicación no ejecuta implementaciones.'})}
 ${inputField('Fecha y hora programadas','scheduledAt',r.review?.scheduledAt||r.proposedSchedule||'',{required:true,type:'datetime-local'})}
 ${inputField('Recursos humanos, técnicos y materiales','resources',r.review?.resources||r.resources||'',{required:true})}
 ${inputField('Esfuerzo previsto (horas)','effortHours',r.review?.effortHours||r.effortHours||'',{required:true,type:'number'})}
 ${inputField('Costo estimado (USD)','costUSD',r.review?.costUSD??cost,{required:true,type:'number',hint:'Ingresar 0 si no se requiere gasto adicional.'})}
 ${inputField('Situación del presupuesto','budgetStatus',r.review?.budgetStatus||'',{required:true,values:budgetOptions})}
 </div>
 <h4>F · Resolución del comité</h4>
 <div class="review-grid">
 ${inputField('Nombre de la persona que decide','reviewer',r.review?.reviewer||'',{required:true,placeholder:'Ej. Coordinador del comité'})}
 ${inputField('Revisores / participantes','reviewers',r.review?.reviewers||'',{placeholder:'Ej. Equipo de calidad y líder técnico'})}
 ${inputField('Restricciones y condiciones','restrictions',r.review?.restrictions||'',{multiline:true,wide:true,placeholder:'Ej. Solo en ventana de mantenimiento; requerir respaldo verificado...'})}
 </div>`;
}
function approvedReview(r){
 const v=r.review||{};
 const fields=[
   ['Propietario del cambio',v.changeOwner],['Prioridad asignada',v.assignedPriority],['Clasificación ITIL',({'normal':'Normal','estandar':'Estándar (preautorizado)','emergencia':'Emergencia'}[v.itilClass]||v.itilClass)],
   ...(v.preauthReference?[['Autorización previa',v.preauthReference]]:[]),...(v.emergencyReason?[['Motivo de emergencia',v.emergencyReason]]:[]),
   ['Razón / caso de negocio',v.businessReason],['Beneficios esperados',v.benefits],['Consecuencias de no implementar',v.nonImplementation],['Áreas afectadas',v.businessAreas],['Servicios afectados',v.affectedServices],['CI afectados',v.affectedCIs],['Impacto',v.impact],['Riesgos',v.risks],['Mitigación',v.mitigation],['Plan de implementación',v.implementationPlan],['Plan de reversión',v.rollbackPlan],['Calendario',v.scheduledAt?dateOf(v.scheduledAt):'No registrado'],['Recursos',v.resources],['Esfuerzo',v.effortHours?`${v.effortHours} horas`:'No registrado'],['Costo previsto',v.costUSD!==undefined?`USD ${v.costUSD}`:'No registrado'],['Presupuesto',({'aprobado':'Aprobado','pendiente':'Pendiente','no_requerido':'No requerido'}[v.budgetStatus]||v.budgetStatus)],['Revisores',v.reviewers],['Restricciones',v.restrictions]
 ];return fields.map(([label,val])=>info(label,val,['Razón / caso de negocio','Beneficios esperados','Consecuencias de no implementar','Riesgos','Mitigación','Plan de implementación','Plan de reversión','Restricciones'].includes(label))).join('');
}
function auditHTML(r){const logs=(r.audit?.length?r.audit:[{action:'Solicitud RFC registrada',at:r.createdAt,actor:r.requester},...(r.decision?[{action:'Decisión del comité: '+r.status,at:r.decision.decidedAt,actor:r.decision.reviewer}]:[])]);return logs.map(t=>`<div class="audit-item"><b>${esc(t.action)}</b> · ${esc(dateOf(t.at))} · ${esc(t.actor||'Sin identificación')}</div>`).join('');}
function renderDetail(){
 if(state.account?.role!=='comite')return;
 const r=requests.find(x=>x.id===state.selectedId);
 if(!r){$('detailPanel').innerHTML='<div class="empty"><span class="empty-icon">▤</span><h3>Selecciona un reporte</h3><p>Elige una solicitud para evaluarla.</p></div>';return;}
 const attach=r.attachment&&typeof r.attachment.data==='string'&&r.attachment.data.startsWith('data:')?`<div class="info-block wide"><label>Documento adjunto</label><a class="attachment-link" download="${esc(r.attachment.name)}" href="${esc(r.attachment.data)}">↧ Descargar ${esc(r.attachment.name)}</a></div>`:info('Documentos adjuntos','No se adjuntaron archivos',true);
 const common=`${info('ID único de solicitud',r.id)}${info('Fecha de presentación',dateOf(r.createdAt))}${info('Iniciador / solicitante',r.requester)}${info('Perfil de usuario',r.origin==='pasajero'?'Pasajero · Acceso público':'Desarrollador · Acceso restringido')}${info('Rol o especialidad',r.origin==='pasajero'?r.requesterRole:r.developerArea)}${info('Correo de contacto',r.contact)}${info('Servicio o módulo propuesto',r.module)}${info('Prioridad propuesta',r.priority)}${info('Categoría funcional',r.changeType)}${info('Origen de solicitud',r.originType)}${info('Descripción del cambio',r.description,true)}${info('Motivo / caso de negocio',r.reason,true)}${info('Beneficios esperados',r.benefits,true)}${info('Si no se implementa',r.nonImplementation,true)}`;
 const extra=r.origin==='pasajero'?info('Ruta, fecha o reserva',r.reference):`${info('ID de tarea / rama Git',r.traceability)}${info('¿Se realizaron pruebas?',r.testsPerformed)}${info('Detalle de pruebas',r.testNotes,true)}${info('Áreas del negocio',r.businessAreas)}${info('CI propuestos',r.affectedCIs)}${info('Impacto y riesgo preliminar',r.impactRisk,true)}${info('Esfuerzo propuesto',r.effortHours?`${r.effortHours} horas`:'No registrado')}${info('Costo propuesto (USD)',r.costUSD)}${info('Personal y recursos propuestos',r.resources)}${info('Fecha sugerida',r.proposedSchedule?dateOf(r.proposedSchedule):'No registrada')}${info('Mitigación propuesta',r.mitigation,true)}${info('Implementación propuesta',r.implementationPlan,true)}${info('Reversión propuesta',r.rollbackPlan,true)}`;
 const decision=r.status==='pendiente'?
 `<section class="detail-section"><h3 class="section-title"><span class="section-dot"></span> Evaluación y resolución RFC · Comité</h3><p class="form-sub">Completa o verifica los campos del reporte. Para aprobar, son obligatorios la identificación, el caso de negocio, el riesgo, el costo, los recursos y ambos planes.</p><form id="decisionForm" class="review-form" data-id="${esc(r.id)}" novalidate>${reviewFields(r)}<div class="decision-options"><label class="decision-card"><input type="radio" name="decision" value="aprobada"> ✓ Aprobar</label><label class="decision-card"><input type="radio" name="decision" value="rechazada"> ✕ Rechazar</label></div><div class="review-grid"><div class="field wide"><label for="committeeReason">Fundamento de la resolución / razón del rechazo <span class="review-required">*</span></label><textarea id="committeeReason" name="reason" minlength="10" maxlength="1400" rows="4" placeholder="Explica por qué se autoriza o rechaza el cambio..."></textarea></div></div><div class="review-note alert">Solo aprobar si ya constan el plan de implementación y el de reversión. No se realiza ningún despliegue desde este prototipo. La decisión queda registrada con fecha, responsable y datos del análisis.</div><div class="form-actions"><button class="btn btn-primary" type="submit">Registrar decisión del comité ✓</button></div></form></section>`:
 `<section class="detail-section"><h3 class="section-title"><span class="section-dot"></span> Resolución y evaluación del comité</h3><div class="helper-note ${r.status==='rechazada'?'bad':''}"><span>${r.status==='aprobada'?'✓':'✕'}</span><strong>Solicitud ${esc(r.status)} · Resolución cerrada en esta demostración.</strong></div><div class="info-grid">${info('Decisión final',r.status)}${info('Fecha de la resolución',dateOf(r.decision?.decidedAt))}${info('Responsable de la decisión',r.decision?.reviewer)}${info('Fundamento',r.decision?.reason,true)}${approvedReview(r)}</div></section>`;
 $('detailPanel').innerHTML=`<div class="detail-head"><div class="detail-kicker"><span>REPORTE RFC · ${esc(r.id)}</span>${badge(r.status)}</div><h2>${esc(brief(r.description,180))}</h2><div class="detail-meta"><span>◉ ${esc(r.requester)}</span><span>▦ ${esc(r.module)}</span><span>◷ ${esc(dateOf(r.createdAt))}</span></div><div class="evidence-bar"><button type="button" class="btn btn-secondary" id="exportRFC" data-export="${esc(r.id)}">↓ Exportar evidencia RFC (JSON)</button></div></div><div class="detail-body"><section class="detail-section"><h3 class="section-title"><span class="section-dot"></span> Solicitud original · Datos inalterados</h3><div class="info-grid">${common}${extra}${attach}</div></section>${decision}<section class="detail-section"><h3 class="section-title"><span class="section-dot"></span> Historial de trazabilidad</h3><div class="audit-list">${auditHTML(r)}</div><p class="classification-note">Este historial demuestra el concepto de trazabilidad. Se almacena localmente y NO constituye auditoría inviolable ni firma digital.</p></section></div>`;
}
function renderCommittee(){if(state.account?.role!=='comite')return;renderFunctionalTypes();renderStats();renderList();renderDetail();}
function decide(event){
 if(event.target.id!=='decisionForm')return;
 event.preventDefault();if(state.account?.role!=='comite')return;
 const form=event.target;
 const id=form.dataset.id, original=requests.find(r=>r.id===id);
 if(!original||original.status!=='pendiente'){notify('Este reporte ya fue resuelto.',true);renderCommittee();return;}
 const outcome=valueOf(form,'decision'),reason=valueOf(form,'reason');
 const read=['changeOwner','assignedPriority','itilClass','preauthReference','emergencyReason','businessReason','benefits','nonImplementation','businessAreas','affectedServices','affectedCIs','impact','risks','mitigation','rollbackPlan','implementationPlan','scheduledAt','resources','effortHours','costUSD','budgetStatus','reviewer','reviewers','restrictions'];
 const review={};for(const key of read)review[key]=valueOf(form,key);
 const issue=(message,field)=>{notify(message,true);if(field){const element=form.elements.namedItem(field);if(element?.focus)element.focus();}return;};
 if(!['aprobada','rechazada'].includes(outcome))return issue('Selecciona Aprobar o Rechazar la solicitud.');
 if(!review.reviewer)return issue('Indica el nombre de quien toma la decisión.','reviewer');
 if(reason.length<10)return issue('Escribe una justificación de al menos 10 caracteres.','reason');
 if(outcome==='aprobada'){
   const mandatory=['changeOwner','assignedPriority','itilClass','businessReason','benefits','nonImplementation','businessAreas','affectedServices','affectedCIs','impact','risks','mitigation','rollbackPlan','implementationPlan','scheduledAt','resources','effortHours','costUSD','budgetStatus'];
   const missing=mandatory.find(key=>!review[key]);
   if(missing){const labels={changeOwner:'Propietario del cambio',businessReason:'Razón del cambio',benefits:'Beneficios',nonImplementation:'Consecuencias si no se implementa',businessAreas:'Áreas afectadas',affectedCIs:'CI afectados',costUSD:'Costo',scheduledAt:'Fecha programada',rollbackPlan:'Plan de reversión',implementationPlan:'Plan de implementación'};return issue(`Para aprobar es obligatorio completar: ${labels[missing]||missing}.`,missing);}
   if(!['normal','estandar','emergencia'].includes(review.itilClass))return issue('Selecciona una clasificación ITIL válida.','itilClass');
   if(review.itilClass==='estandar'&&!review.preauthReference.trim())return issue('Un cambio ESTÁNDAR requiere el código de autorización previa.','preauthReference');
   if(review.itilClass==='emergencia'&&review.emergencyReason.trim().length<12)return issue('Justifica la atención inmediata de esta EMERGENCIA (mínimo 12 caracteres).','emergencyReason');
   if(Number(review.costUSD)<0||Number(review.effortHours)<=0||!Number.isFinite(Number(review.costUSD))||!Number.isFinite(Number(review.effortHours)))return issue('Costo (puede ser 0) y esfuerzo (mayor a 0) deben ser números válidos.','costUSD');
   if(review.implementationPlan.trim().length<12||review.rollbackPlan.trim().length<12)return issue('Detalla los planes de implementación y reversión (mínimo 12 caracteres cada uno).','rollbackPlan');
   if(review.risks.trim().length<8||review.mitigation.trim().length<8)return issue('Documenta riesgos y contramedidas antes de aprobar.','mitigation');
   if(!Number.isFinite(new Date(review.scheduledAt).getTime()))return issue('Indica una fecha programada válida.','scheduledAt');
   if(new Date(review.scheduledAt).getTime() < Date.now()-60000)return issue('Programa una fecha y hora futuras antes de aprobar el cambio.','scheduledAt');
   if(review.budgetStatus==='pendiente'&&Number(review.costUSD)>0)return issue('Para aprobar un cambio con costo debe existir presupuesto aprobado.','budgetStatus');
   if(review.budgetStatus==='no_requerido'&&Number(review.costUSD)>0)return issue('Si el cambio tiene costo, no puede marcar presupuesto como no requerido.','budgetStatus');
 }
 if(!confirm(`¿Registrar resolución definitiva ${outcome.toUpperCase()} para ${id}?`))return;
 const decidedAt=new Date().toISOString();
 const next=requests.map(r=>r.id===id?{...r,status:outcome,review,decision:{outcome,reason,reviewer:review.reviewer,decidedAt},audit:[...(r.audit||[{action:'Solicitud RFC registrada',at:r.createdAt,actor:r.requester}]),{action:'Comité: '+(outcome==='aprobada'?'RFC aprobada':'RFC rechazada'),at:decidedAt,actor:review.reviewer}]}:r);
 if(save(next)){renderCommittee();notify(`Solicitud ${id} ${outcome} y documentada.`);}
}
function exportRFC(id){
 if(state.account?.role!=='comite')return;
 const req=requests.find(r=>r.id===id);if(!req)return;
 const {attachment,...copy}=req;
 const evidence={...copy,attachment:attachment?{name:attachment.name,size:attachment.size,type:attachment.type,nota:'El binario adjunto se conserva solo dentro del navegador; no se incluye en la exportación JSON.'}:null,
   exportadoEn:new Date().toISOString(),nota:'Prototipo con almacenamiento local. No es registro de auditoría inviolable.'};
 const blob=new Blob([JSON.stringify(evidence,null,2)],{type:'application/json;charset=utf-8'});
 const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`${req.id}_evidencia_RFC.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 notify('Evidencia RFC exportada para '+req.id);
}
$('guestButton').addEventListener('click',()=>sessionAs('pasajero'));
$('loginForm').addEventListener('submit',e=>{e.preventDefault();const username=$('loginUser').value.trim().toLowerCase();const candidate=Object.hasOwn(USERS,username)?USERS[username]:null;const ok=!!candidate&&candidate.password===$('loginPassword').value;$('loginError').hidden=ok;if(ok)sessionAs(username);else $('loginPassword').focus();});
$('logoutButton').addEventListener('click',logout);$('logoutTop').addEventListener('click',logout);
$('passengerForm').addEventListener('submit',e=>sendRequest(e,'pasajero'));
$('developerForm').addEventListener('submit',e=>sendRequest(e,'desarrollador'));
['passengerForm','developerForm'].forEach(id=>$(id).addEventListener('reset',()=>{$('submissionResult').hidden=true;}));
$('searchInput').addEventListener('input',e=>{state.search=e.target.value.trim().toLocaleLowerCase('es');renderList();});
$('statusFilter').addEventListener('change',e=>{state.filter=e.target.value;renderList();});
$('priorityFilter').addEventListener('change',e=>{state.priorityFilter=e.target.value;renderList();});
$('functionalFilter').addEventListener('change',e=>{state.functionalFilter=e.target.value;renderList();});
$('requestList').addEventListener('click',e=>{if(state.account?.role!=='comite')return;const item=e.target.closest('[data-request-id]');if(item){state.selectedId=item.dataset.requestId;renderList();renderDetail();}});
$('detailPanel').addEventListener('submit',decide);
$('detailPanel').addEventListener('click',e=>{const btn=e.target.closest('[data-export]');if(btn)exportRFC(btn.dataset.export);});
window.addEventListener('storage',e=>{if(e.key!==STORAGE_KEY)return;requests=loadRequests();if(!requests.some(r=>r.id===state.selectedId))state.selectedId=requests[0]?.id||null;renderCommittee();stamp();});
try{const active=sessionStorage.getItem(SESSION_KEY);if(active&&Object.hasOwn(USERS,active))sessionAs(active);}catch(err){/* local demo */}
stamp();
