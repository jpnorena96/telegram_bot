import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

const TermsPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', color: 'var(--text-1)', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', background: 'var(--bg)', borderRadius: '16px', padding: '3rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid var(--border)' }}>
        
        <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={16} /> Volver
        </button>

        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <Shield size={48} color="var(--lime)" style={{ margin: '0 auto 1rem auto' }} />
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em', marginBottom: '1rem' }}>
            Política de Privacidad Global y Tratamiento de Datos
          </h1>
          <p style={{ color: 'var(--text-2)' }}>Última actualización: Agosto 2026</p>
        </div>

        <div style={{ lineHeight: '1.8', fontSize: '1rem', color: 'var(--text-1)' }}>
          <p style={{ marginBottom: '1.5rem' }}>
            En Tricolor Red Social, valoramos su privacidad. Este documento explica cómo recolectamos, usamos y protegemos su información en cumplimiento con la Ley 1581 de 2012 (Colombia), el Reglamento General de Protección de Datos (RGPD - UE) y la Ley de Privacidad del Consumidor de California (CCPA/CPRA - EE. UU.).
          </p>

          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-1)' }}>1. Responsable del Tratamiento</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            El responsable del tratamiento de sus datos personales es Tricolor Red Social, con domicilio en Bogotá, Colombia y correo electrónico de contacto: <strong>info@soytricolor.com</strong>
          </p>

          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-1)' }}>2. Información que Recolectamos</h3>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-2)' }}>
            <li><strong>Datos de Identificación:</strong> Nombre de usuario, correo electrónico y fecha de nacimiento.</li>
            <li><strong>Datos de Ubicación:</strong> Geografía regional (departamento/ciudad) para personalizar su experiencia con contenido local, eventos, cultura y noticias de interés, solo si usted lo autoriza.</li>
            <li><strong>Datos de Contenido:</strong> Opiniones, comentarios, fotos y videos relacionados con estilo de vida, turismo, gastronomía, deportes, arte, cultura, política y cualquier tema de interés general vinculado a la identidad colombiana.</li>
            <li><strong>Datos Técnicos:</strong> Dirección IP, tipo de dispositivo y cookies.</li>
          </ul>

          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-1)' }}>3. Finalidad del Tratamiento</h3>
          <p style={{ marginBottom: '1rem' }}>Sus datos serán utilizados para:</p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-2)' }}>
            <li>Permitir la interacción y publicación de contenido global sobre Colombia en todas sus facetas.</li>
            <li>Personalizar su "feed" o muro según sus intereses (ej. cultura, emprendimiento, noticias locales o entretenimiento).</li>
            <li>Garantizar un entorno seguro, libre de discriminación y proteger la veracidad de la información en temas de interés público.</li>
          </ul>

          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-1)' }}>4. Bases Legales para el Tratamiento</h3>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-2)' }}>
            <li><strong>Consentimiento:</strong> Usted acepta el tratamiento al registrarse.</li>
            <li><strong>Ejecución de Contrato:</strong> Necesitamos sus datos para que la app funcione.</li>
            <li><strong>Cumplimiento Legal:</strong> Para prevenir fraudes o delitos en temas de orden público.</li>
          </ul>

          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-1)' }}>5. Sus Derechos Globales (Habeas Data)</h3>
          <p style={{ marginBottom: '1rem' }}>Sin importar su ubicación geográfica, usted tiene derecho a:</p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-2)' }}>
            <li><strong>Acceso y Rectificación:</strong> Consultar y corregir sus datos.</li>
            <li><strong>Supresión (Derecho al Olvido):</strong> Solicitar la eliminación total de su cuenta y rastro digital.</li>
            <li><strong>Oposición:</strong> Negarse a que sus datos se usen para fines de publicidad o perfiles automáticos.</li>
            <li><strong>Derechos Específicos de California (CCPA):</strong> Usted tiene derecho a decir "No vendan mi información personal". Declaramos expresamente que no vendemos sus datos a terceros.</li>
          </ul>

          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-1)' }}>6. Protección de Menores de Edad</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            De acuerdo con los estándares internacionales (COPPA y RGPD) y la protección constitucional en Colombia, no permitimos el registro de menores de 14 años. Si descubrimos datos de un menor de 14 años sin consentimiento parental verificable, procederemos a la eliminación inmediata de la información.
          </p>

          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-1)' }}>7. Seguridad de la Información</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            Implementamos medidas técnicas de cifrado y protocolos de seguridad para proteger sus datos contra acceso no autorizado, alteración o pérdida, especialmente en debates sensibles sobre política y orden público.
          </p>

          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-1)' }}>8. Transferencia Internacional de Datos</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            Al usar esta red social, usted acepta que sus datos puedan ser almacenados en servidores ubicados en el extranjero (por ejemplo, en la nube de AWS o Google Cloud), garantizando siempre niveles adecuados de protección de datos.
          </p>

          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-1)' }}>9. Modificaciones</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            Nos reservamos el derecho de actualizar esta política. Notificaremos cualquier cambio sustancial a través de la plataforma o por correo electrónico.
          </p>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '3rem 0' }} />

          <h2 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em', marginBottom: '1.5rem', textAlign: 'center' }}>
            Términos y Condiciones de Uso
          </h2>

          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-1)' }}>1. Objeto y Alcance Global</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            Tricolor es una plataforma de interacción global diseñada para conectar a personas interesadas en Colombia. El contenido puede abarcar cualquier temática (social, cultural, deportiva, informativa o de entretenimiento), siempre que respete los presentes términos.
          </p>

          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-1)' }}>2. Diversidad de Contenido y Convivencia</h3>
          <p style={{ marginBottom: '1rem' }}>La plataforma permite la libre expresión sobre una amplia variedad de temas, bajo las siguientes premisas:</p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-2)' }}>
            <li><strong>Variedad Temática:</strong> Los usuarios pueden compartir contenido sobre turismo, tradiciones, emprendimiento, vida cotidiana, actualidad, etc.</li>
            <li><strong>Veracidad en Información de Interés:</strong> Aunque se permite el contenido de opinión y entretenimiento, se prohíbe la difusión deliberada de noticias falsas que busquen desinformar sobre la realidad del país o afectar a terceros.</li>
            <li><strong>Respeto en Debates:</strong> En caso de discusiones sobre política o temas sensibles, se exige un lenguaje constructivo que no incite a la violencia o al delito.</li>
          </ul>

          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-1)' }}>3. Respeto a la Identidad Regional</h3>
          <p style={{ marginBottom: '1rem' }}>Siendo una red enfocada en Colombia, se promueve el orgullo por todas sus regiones.</p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-2)' }}>
            <li><strong>Tolerancia Cero a la Discriminación:</strong> Queda prohibida cualquier burla, estigmatización o discurso de odio basado en el origen regional, acento o pertenencia a grupos étnicos (afrocolombianos, indígenas, raizales, etc.).</li>
            <li><strong>Promoción Cultural:</strong> Se incentiva la creación de contenido que resalte la riqueza multicultural de cada departamento del país.</li>
          </ul>

          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-1)' }}>4. Responsabilidad del Usuario y Moderación</h3>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-2)' }}>
            <li><strong>Responsabilidad Civil/Penal:</strong> El usuario es el único responsable legal de sus opiniones sobre orden público. La plataforma cooperará con las autoridades judiciales colombianas e internacionales mediante orden legal si se detectan delitos.</li>
            <li><strong>Herramientas de Reporte:</strong> Los usuarios cuentan con una función de "Reporte por Odio Regional" o "Información Falsa" para alertar al equipo de moderación.</li>
          </ul>

          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-1)' }}>5. Privacidad y Tratamiento de Datos (Ley 1581 y RGPD)</h3>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-2)' }}>
            <li><strong>Habeas Data:</strong> En cumplimiento de la Ley 1581 de 2012, el usuario autoriza el tratamiento de sus datos para el funcionamiento de la red.</li>
            <li><strong>Geolocalización:</strong> Si el usuario activa su ubicación para interactuar con contenido regional, estos datos serán cifrados y no se compartirán con terceros sin consentimiento expreso.</li>
            <li><strong>Derecho al Olvido:</strong> Cualquier usuario, sin importar su país, puede solicitar la eliminación total de sus datos y rastro digital en la plataforma.</li>
          </ul>

          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-1)' }}>6. Propiedad Intelectual</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            Usted es dueño del contenido que publica (fotos de paisajes, recetas, opiniones, etc.). Al compartirlo, garantiza que posee los derechos necesarios y otorga a la plataforma una licencia para mostrarlo a otros usuarios según su configuración de privacidad.
          </p>

          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-1)' }}>7. Jurisdicción y Resolución de Conflictos</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            Cualquier controversia se someterá a los centros de conciliación de la Cámara de Comercio de Bogotá. Para usuarios internacionales, se buscarán mecanismos de arbitraje virtual antes de escalar a instancias judiciales.
          </p>

          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-1)' }}>8. Socialización y Disponibilidad</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            La presente Política de Privacidad, uso de datos y los Términos y Condiciones de Uso se encuentran a disposición de todos los usuarios para su consulta permanente en el formulario de registro de la aplicación. Cualquier modificación o actualización será comunicada a través de estos mismos canales.
          </p>

          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-1)' }}>Contacto</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            Para la atención de peticiones, consultas o reclamos relacionados con el tratamiento de datos personales o el uso de la plataforma, el usuario podrá dirigirse a los siguientes canales de atención: <strong>info@soytricolor.com</strong> o <strong>soytricolorapp@gmail.com</strong>
          </p>

        </div>
      </div>
    </div>
  );
};

export default TermsPage;
