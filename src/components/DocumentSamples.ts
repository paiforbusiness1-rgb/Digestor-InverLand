import { RealEstateDocument } from '../types';

export const SAMPLE_DOCUMENTS: RealEstateDocument[] = [
  {
    id: 'sample-escritura',
    name: 'Escritura_Compraventa_45201_Notaria_12.pdf',
    type: 'pdf_scanned',
    category: 'escritura',
    size: '4.2 MB',
    uploadedAt: '16/07/2026',
    status: 'completed',
    content: `ESCRITURA NÚMERO CUARENTA Y CINCO MIL DOSCIENTOS UNO (45,201). VOLUMEN 1,204.
En la Ciudad de México, a 12 de Febrero de 2026, yo, el Licenciado Felipe Aguilar Cruz, titular de la Notaría Pública Número 12 de esta demarcación, hago constar el CONTRATO DE COMPRAVENTA que otorgan:

Por una parte, como LA VENDEDORA, la sociedad mercantil denominada "Inmobiliaria Bosques, S.A. de C.V.", representada legalmente en este acto por el Ing. Roberto Lozano Silva.
Por otra parte, como EL COMPRADOR, el señor Carlos Mendoza Ruiz, por su propio derecho.

DECLARACIONES:
I. Declara LA VENDEDORA que es propietaria legítima del inmueble ubicado en: Avenida Paseo de la Reforma Número 402, Colonia Juárez, Alcaldía Cuauhtémoc, Código Postal 06600, en esta Ciudad de México.
II. El inmueble cuenta con una superficie total privativa de 145.50 metros cuadrados (ciento cuarenta y cinco punto cincuenta metros cuadrados) y los linderos descritos en el plano catastral anexo. Cuenta con la Cuenta Catastral número 012-405-18-00-1.
III. Declara bajo protesta de decir verdad que el inmueble se encuentra libre de todo gravamen y al corriente en el pago de sus contribuciones de predial y agua.

CLÁUSULAS:
PRIMERA. DE LA COMPRAVENTA. "Inmobiliaria Bosques, S.A. de C.V." vende y el señor Carlos Mendoza Ruiz compra y adquiere, libre de todo gravamen, el inmueble descrito en la declaración primera de este instrumento, con todo lo que de hecho y por derecho le corresponda.

SEGUNDA. DEL PRECIO. El precio convenido por las partes es la cantidad de $4,500,000.00 M.N. (CUATRO MILLONES QUINIENTOS MIL PESOS, MONEDA NACIONAL), los cuales el comprador paga en este acto mediante transferencia electrónica SPEI interbancaria hacia la cuenta de la parte vendedora, quien otorga el recibo más eficaz en derecho por dicha cantidad.

TERCERA. DE LA ENTREGA Y SANEAMIENTO. LA VENDEDORA se obliga a entregar la posesión física y jurídica del inmueble de forma inmediata al firmar la presente escritura, libre de ocupantes o arrendatarios. Asimismo, se obliga al saneamiento para el caso de evicción en los términos de la ley aplicable.

CUARTA. DE LOS GASTOS E IMPUESTOS. Todos los gastos, honorarios de notaría, derechos de registro e impuestos de adquisición de inmuebles (ISAI) serán por cuenta exclusiva de EL COMPRADOR, con excepción del Impuesto Sobre la Renta (ISR) por enajenación, el cual será cubierto por LA VENDEDORA de acuerdo a la legislación fiscal vigente.

ALERTAS DE RIESGO / NOTAS NOTARIALES ADICIONALES:
Nota: Se observa una discrepancia menor en la escritura previa respecto a la colindancia norte, indicando 12.4 metros en lugar de los 12.5 metros reportados en la medición satelital actual. Las partes manifiestan su conformidad y se comprometen a ratificar linderos ante la Dirección de Catastro local en un plazo no mayor a 90 días naturales para evitar futuras multas o disputas de propiedad colindante.`,
    analysis: {
      summary: 'Escritura de compraventa del inmueble ubicado en Av. Paseo de la Reforma 402. Se formaliza la transferencia de propiedad de Inmobiliaria Bosques a Carlos Mendoza por un monto de $4.5M MXN. El inmueble tiene una superficie de 145.50 m² y cuenta con libre gravamen formal. Se registra una discrepancia menor de linderos colindantes de 10 cm que requiere ratificación catastral en un plazo de 90 días.',
      legalRiskSummary: 'Este expediente de compraventa presenta un perfil de riesgo legal general BAJO. El título de propiedad se encuentra formalizado mediante escritura pública ante Notario Público. La principal observación identificada reside en la nota notarial complementaria respecto a una discrepancia física de linderos de 10 cm en la colindancia norte (12.4m vs 12.5m). Si bien ambas partes manifestaron conformidad, existe el compromiso de realizar el trámite catastral administrativo de ratificación de linderos en un plazo improrrogable de 90 días naturales para evitar demoras en el registro definitivo de propiedad o multas. Se aconseja dar seguimiento inmediato a este trámite para asegurar la perfecta concordancia de las medidas registrales.',
      entities: {
        buyerOrTenant: 'Carlos Mendoza Ruiz',
        sellerOrLandlord: 'Inmobiliaria Bosques, S.A. de C.V.',
        notary: 'Lic. Felipe Aguilar Cruz (Notaría 12, CDMX)',
        propertyAddress: 'Avenida Paseo de la Reforma Número 402, Colonia Juárez, Alcaldía Cuauhtémoc, CP 06600, CDMX',
        cadastralKey: '012-405-18-00-1'
      },
      metrics: {
        surfaceArea: '145.50 m²',
        transactionAmount: '4,500,000.00',
        currency: 'MXN',
        duration: 'N/A (Transferencia de dominio permanente)'
      },
      dates: {
        signingDate: '2026-02-12',
        expirationDate: 'N/A',
        registrationDate: '2026-02-12'
      },
      keyClauses: [
        {
          title: 'Precio y Pago (Cláusula Segunda)',
          summary: 'Monto de $4,500,000.00 MXN liquidado de contado en el acto mediante transferencia SPEI.',
          risk: 'low',
          riskExplanation: 'Pago completado y acreditado ante notario, eliminando el riesgo de falta de liquidez o rescisión por falta de pago.'
        },
        {
          title: 'Saneamiento y Evicción (Cláusula Tercera)',
          summary: 'La vendedora garantiza la posesión física/jurídica inmediata y responde por saneamiento por evicción.',
          risk: 'low',
          riskExplanation: 'Protección legal estándar robusta para el comprador.'
        },
        {
          title: 'Ratificación de Linderos (Nota Notarial)',
          summary: 'Compromiso mutuo de ratificar una diferencia de linderos de 10 cm en colindancia norte ante Catastro en 90 días.',
          risk: 'medium',
          riskExplanation: 'Si no se realiza el trámite en 90 días, podría haber retrasos en el registro definitivo o multas por parte de la Dirección de Catastro local.'
        }
      ],
      alerts: [
        {
          type: 'info',
          message: 'Inmueble declarado libre de gravámenes prediales y de agua.'
        },
        {
          type: 'warning',
          message: 'Existe discrepancia física de linderos norte (12.4m vs 12.5m) que requiere trámite catastral administrativo complementario.'
        }
      ],
      criticalDeadlines: [
        {
          title: "Inscripción en Registro Público (RPP)",
          date: "2026-03-14",
          description: "Plazo recomendado de 30 días hábiles para lograr la inscripción registral de la escritura pública y dotar de plenos efectos frente a terceros.",
          priority: "high"
        },
        {
          title: "Ratificación de Linderos ante Catastro",
          date: "2026-05-13",
          description: "Plazo improrrogable de 90 días naturales posteriores a la firma para formalizar el ajuste físico de colindancia de 10 cm y evitar sanciones catastrales.",
          priority: "medium"
        }
      ],
      ocrExtracted: true,
      ocrMethodUsed: 'Tesseract OCR + Cloud Vision Layout Parsing',
      extractedText: `TRANSCRIPCIÓN COMPLETA DEL TEXTO EXTRAÍDO POR OCR (ESCRITURA PÚBLICA):

ESCRITURA NÚMERO CUARENTA Y CINCO MIL DOSCIENTOS UNO (45,201). VOLUMEN 1,204.
En la Ciudad de México, a 12 de Febrero de 2026, yo, el Licenciado Felipe Aguilar Cruz, titular de la Notaría Pública Número 12 de esta demarcación, hago constar el CONTRATO DE COMPRAVENTA que otorgan:

Por una parte, como LA VENDEDORA, la sociedad mercantil denominada "Inmobiliaria Bosques, S.A. de C.V.", representada legalmente en este acto por el Ing. Roberto Lozano Silva.
Por otra parte, como EL COMPRADOR, el señor Carlos Mendoza Ruiz, por su propio derecho.

DECLARACIONES:
I. Declara LA VENDEDORA que es propietaria legítima del inmueble ubicado en: Avenida Paseo de la Reforma Número 402, Colonia Juárez, Alcaldía Cuauhtémoc, Código Postal 06600, en esta Ciudad de México.
II. El inmueble cuenta con una superficie total privativa de 145.50 metros cuadrados (ciento cuarenta y cinco punto cincuenta metros cuadrados) y los linderos descritos en el plano catastral anexo. Cuenta con la Cuenta Catastral número 012-405-18-00-1.
III. Declara bajo protesta de decir verdad que el inmueble se encuentra libre de todo gravamen y al corriente en el pago de sus contribuciones de predial y agua.

CLÁUSULAS:
PRIMERA. DE LA COMPRAVENTA. "Inmobiliaria Bosques, S.A. de C.V." vende y el señor Carlos Mendoza Ruiz compra y adquiere, libre de todo gravamen, el inmueble descrito en la declaración primera de este instrumento, con todo lo que de hecho y por derecho le corresponda.

SEGUNDA. DEL PRECIO. El precio convenido por las partes es la cantidad de $4,500,000.00 M.N. (CUATRO MILLONES QUINIENTOS MIL PESOS, MONEDA NACIONAL), los cuales el comprador paga en este acto mediante transferencia electrónica SPEI interbancaria hacia la cuenta de la parte vendedora, quien otorga el recibo más eficaz en derecho por dicha cantidad.

TERCERA. DE LA ENTREGA Y SANEAMIENTO. LA VENDEDORA se obliga a entregar la posesión física y jurídica del inmueble de forma inmediata al firmar la presente escritura, libre de ocupantes o arrendatarios. Asimismo, se obliga al saneamiento para el caso de evicción en los términos de la ley aplicable.

CUARTA. DE LOS GASTOS E IMPUESTOS. Todos los gastos, honorarios de notaría, derechos de registro e impuestos de adquisición de inmuebles (ISAI) serán por cuenta exclusiva de EL COMPRADOR, con excepción del Impuesto Sobre la Renta (ISR) por enajenación, el cual será cubierto por LA VENDEDORA de acuerdo a la legislación fiscal vigente.

ALERTAS DE RIESGO / NOTAS NOTARIALES ADICIONALES:
Nota: Se observa una discrepancia menor en la escritura previa respecto a la colindancia norte, indicando 12.4 metros en lugar de los 12.5 metros reportados en la medición satelital actual. Las partes manifiestan su conformidad y se comprometen a ratificar linderos ante la Dirección de Catastro local en un plazo no mayor a 90 días naturales para evitar futuras multas o disputas de propiedad colindante.

FIN DE LA TRANSCRIPCIÓN.`
    }
  },
  {
    id: 'sample-contrato',
    name: 'Contrato_Arrendamiento_Comercial_Local_4B.pdf',
    type: 'pdf_native',
    category: 'contrato',
    size: '1.8 MB',
    uploadedAt: '15/07/2026',
    status: 'completed',
    content: `CONTRATO DE ARRENDAMIENTO COMERCIAL
Conste por el presente instrumento el Contrato de Arrendamiento Comercial que celebran en la ciudad de Guadalajara, Jalisco, con fecha 1 de Enero de 2026, las partes siguientes:

EL ARRENDADOR: "Plazas de Occidente, S.A. de C.V.", representada por el Lic. Jorge González Ortiz.
EL ARRENDATARIO: "Cafeterías Gourmet del Norte, S. de R.L. de C.V.", representada por la Sra. Elena Torres Blancas.

DECLARACIONES:
I. Declara EL ARRENDADOR que cuenta con las facultades legales para arrendar el Local Comercial número 4-B ubicado en el Centro Comercial "Plaza Mayor", con domicilio en Av. Patria Número 1200, Zapopan, Jalisco.
II. El local cuenta con un área comercial útil de 82.00 m² con instalaciones listas para giro alimentario y cafetería.

CLÁUSULAS:
PRIMERA. GIRO COMERCIAL. EL ARRENDATARIO destinará el inmueble única y exclusivamente para la operación de una cafetería y venta de repostería fina. Queda estrictamente prohibido cambiar el giro comercial sin el consentimiento previo y por escrito de EL ARRENDADOR.

SEGUNDA. PLAZO Y VIGENCIA. El plazo de vigencia forzoso de este contrato es de 36 meses (3 años), contados a partir del 1 de Enero de 2026 y concluyendo el 31 de Diciembre de 2028. Al término de la vigencia, no habrá prórroga automática.

TERCERA. DE LA RENTA Y AJUSTES. EL ARRENDATARIO pagará por concepto de renta mensual la cantidad de $35,000.00 M.N. (TREINTA Y CINCO MIL PESOS 00/100 MONEDA NACIONAL) más el Impuesto al Valor Agregado (IVA). El pago deberá efectuarse dentro de los primeros 5 días naturales de cada mes.
A partir del mes número 13, la renta se incrementará de forma anualizada sumando la tasa de inflación reportada por el Banco de México (INPC) más un 4.5% (cuatro punto cinco por ciento) adicional de forma forzosa.

CUARTA. PENALIZACIÓN POR MORA. En caso de que EL ARRENDATARIO no liquide la renta dentro de los primeros 5 días del mes, se aplicará una tasa de interés moratorio punitiva equivalente al 3% (TRES POR CIENTO) DIARIO sobre el saldo insoluto de la renta mensual, acumulable día con día hasta su total liquidación.

QUINTA. FIANZA Y DEPÓSITO en GARANTÍA. Se entrega en este acto el equivalente a dos meses de renta ($70,000.00 M.N.) como depósito en garantía, el cual no devengará intereses y será devuelto al finalizar el arrendamiento, siempre y cuando no existan adeudos de servicios o daños al local. Adicionalmente, se requiere presentar un fiador con bien raíz en la Zona Metropolitana de Guadalajara libre de gravamen.

SEXTA. RESCISIÓN ANTICIPADA. Si EL ARRENDATARIO desea rescindir de manera anticipada el contrato antes del plazo forzoso de 3 años, deberá indemnizar a EL ARRENDADOR pagando el equivalente al 50% de las rentas restantes por el periodo insoluto del contrato.`,
    analysis: {
      summary: 'Contrato de arrendamiento comercial forzoso por 36 meses para un local de cafetería de 82m² en Plaza Mayor. Establece renta de $35k MXN + IVA con incrementos anuales basados en INPC + 4.5%. Incluye cláusulas punitivas sumamente severas por retraso (morosidad del 3% diario) y una fianza del 50% de rentas restantes por terminación anticipada.',
      legalRiskSummary: 'Este contrato presenta un perfil de riesgo legal ALTO. El principal factor de vulnerabilidad radica en la Cláusula Cuarta de Penalización por Mora, que estipula un interés moratorio del 3% diario (usurario e ilegal conforme a la legislación civil de Jalisco, excediendo con creces los límites de lesión y usura). En segundo lugar, la Cláusula Sexta de Rescisión Anticipada exige una indemnización del 50% de las rentas insolutas por el plazo restante, lo cual resulta extremadamente oneroso para el arrendatario ante una eventual quiebra o retiro. Se recomienda negociar la reducción del interés moratorio al 0.1% diario (o una tasa mensual tope del 3% al 5%) y reducir la penalidad por rescisión anticipada al equivalente de 2 o 3 meses de renta como estándar de mercado.',
      entities: {
        buyerOrTenant: 'Cafeterías Gourmet del Norte, S. de R.L. de C.V.',
        sellerOrLandlord: 'Plazas de Occidente, S.A. de C.V.',
        notary: 'N/A (Contrato Privado)',
        propertyAddress: 'Local Comercial 4-B, Centro Comercial Plaza Mayor, Av. Patria 1200, Zapopan, Jalisco',
        cadastralKey: 'N/A o No declarado'
      },
      metrics: {
        surfaceArea: '82.00 m²',
        transactionAmount: '35,000.00 / mes',
        currency: 'MXN',
        duration: '36 meses (1 Ene 2026 - 31 Dic 2028)'
      },
      dates: {
        signingDate: '2026-01-01',
        expirationDate: '2028-12-31',
        registrationDate: 'N/A'
      },
      keyClauses: [
        {
          title: 'Ajuste de Renta (Cláusula Tercera)',
          summary: 'Incremento anual forzoso de INPC (Inflación) + 4.5%.',
          risk: 'medium',
          riskExplanation: 'Un ajuste superior a la inflación representa un costo que puede volverse insostenible si los ingresos del negocio no crecen al mismo ritmo.'
        },
        {
          title: 'Interés Moratorio (Cláusula Cuarta)',
          summary: 'Penalidad de 3% diario por retraso en el pago de la renta mensual.',
          risk: 'high',
          riskExplanation: 'Una tasa moratoria del 3% diario es extremadamente alta, usuraria y equivale a más del 90% mensual, lo que representa un riesgo financiero catastrófico ante cualquier retraso de flujo.'
        },
        {
          title: 'Rescisión Anticipada (Cláusula Sexta)',
          summary: 'Indemnización del 50% de las rentas pendientes de pago en caso de retiro anticipado.',
          risk: 'high',
          riskExplanation: 'Si el negocio quiebra en el primer año, el arrendatario tendría que pagar cerca de 12 meses de renta ($420k MXN) por concepto de multa por salida anticipada.'
        }
      ],
      alerts: [
        {
          type: 'critical',
          message: 'La penalización por mora del 3% diario es excesiva y probablemente ilegal según el Código Civil de Jalisco, pero representa un peligro inmediato de cobranza agresiva.'
        },
        {
          type: 'warning',
          message: 'Multa contractual por terminación anticipada es del 50% de rentas insolutas, extremadamente restrictiva para el emprendimiento.'
        }
      ],
      criticalDeadlines: [
        {
          title: "Pago Mensual de la Renta",
          date: "2026-01-05",
          description: "Fecha límite mensual (dentro de los primeros 5 días naturales) para el abono de renta. El incumplimiento activa el interés moratorio del 3% diario.",
          priority: "high"
        },
        {
          title: "Primer Incremento Anual (INPC + 4.5%)",
          date: "2027-01-01",
          description: "Aplicación automática del ajuste de costo de arrendamiento según inflación anual del periodo más el recargo acordado del 4.5%.",
          priority: "medium"
        },
        {
          title: "Aviso de Renovación Contractual",
          date: "2028-10-01",
          description: "Plazo mínimo de 90 días antes del vencimiento (31-Dic-2028) para notificar formalmente por escrito la intención de renovar el arrendamiento.",
          priority: "medium"
        }
      ],
      ocrExtracted: false,
      ocrMethodUsed: 'Extracción Nativa Digital (Direct PDF Text Stream)',
      extractedText: `TRANSCRIPCIÓN DE TEXTO EXTRAÍDO DIGITALMENTE (CONTRATO):

CONTRATO DE ARRENDAMIENTO COMERCIAL
Conste por el presente instrumento el Contrato de Arrendamiento Comercial que celebran en la ciudad de Guadalajara, Jalisco, con fecha 1 de Enero de 2026, las partes siguientes:

EL ARRENDADOR: "Plazas de Occidente, S.A. de C.V.", representada por el Lic. Jorge González Ortiz.
EL ARRENDATARIO: "Cafeterías Gourmet del Norte, S. de R.L. de C.V.", representada por la Sra. Elena Torres Blancas.

DECLARACIONES:
I. Declara EL ARRENDADOR que cuenta con las facultades legales para arrendar el Local Comercial número 4-B ubicado en el Centro Comercial "Plaza Mayor", con domicilio en Av. Patria Número 1200, Zapopan, Jalisco.
II. El local cuenta con un área comercial útil de 82.00 m² con instalaciones listas para giro alimentario y cafetería.

CLÁUSULAS:
PRIMERA. GIRO COMERCIAL. EL ARRENDATARIO destinará el inmueble única y exclusivamente para la operación de una cafetería y venta de repostería fina. Queda estrictamente prohibido cambiar el giro comercial sin el consentimiento previo y por escrito de EL ARRENDADOR.

SEGUNDA. PLAZO Y VIGENCIA. El plazo de vigencia forzoso de este contrato es de 36 meses (3 años), contados a partir del 1 de Enero de 2026 y concluyendo el 31 de Diciembre de 2028. Al término de la vigencia, no habrá prórroga automática.

TERCERA. DE LA RENTA Y AJUSTES. EL ARRENDATARIO pagará por concepto de renta mensual la cantidad de $35,000.00 M.N. (TREINTA Y CINCO MIL PESOS 00/100 MONEDA NACIONAL) más el Impuesto al Valor Agregado (IVA). El pago deberá efectuarse dentro de los primeros 5 días naturales de cada mes.
A partir del mes número 13, la renta se incrementará de forma anualizada sumando la tasa de inflación reportada por el Banco de México (INPC) más un 4.5% (cuatro punto cinco por ciento) adicional de forma forzosa.

CUARTA. PENALIZACIÓN POR MORA. En caso de que EL ARRENDATARIO no liquide la renta dentro de los primeros 5 días del mes, se aplicará una tasa de interés moratorio punitiva equivalente al 3% (TRES POR CIENTO) DIARIO sobre el saldo insoluto de la renta mensual, acumulable día con día hasta su total liquidación.

QUINTA. FIANZA Y DEPÓSITO en GARANTÍA. Se entrega en este acto el equivalente a dos meses de renta ($70,000.00 M.N.) como depósito en garantía, el cual no devengará intereses y será devuelto al finalizar el arrendamiento, siempre y cuando no existan adeudos de servicios o daños al local. Adicionalmente, se requiere presentar un fiador con bien raíz en la Zona Metropolitana de Guadalajara libre de gravamen.

SEXTA. RESCISIÓN ANTICIPADA. Si EL ARRENDATARIO desea rescindir de manera anticipada el contrato antes del plazo forzoso de 3 años, deberá indemnizar a EL ARRENDADOR pagando el equivalente al 50% de las rentas restantes por el periodo insoluto del contrato.

FIN DE LA TRANSCRIPCIÓN.`
    }
  },
  {
    id: 'sample-plano',
    name: 'Plano_Zonificacion_Terreno_Lote_14_Mirador.png',
    type: 'image',
    category: 'plano',
    size: '12.5 MB',
    uploadedAt: '12/07/2026',
    status: 'completed',
    content: `FICHA TÉCNICA CATASTRAL Y DESCRIPCIÓN DE PLANO DE ZONIFICACIÓN
Departamento de Desarrollo Urbano del Municipio de El Marqués, Querétaro.
Identificador de Predio: Lote 14, Manzana 3, Sección Bosques, Fraccionamiento "El Mirador".

DATOS TÉCNICOS:
- Superficie Total del Terreno: 450.00 metros cuadrados.
- Frente: 15.00 metros sobre Calle de los Crisantemos.
- Fondo: 30.00 metros colindando con Lote Privado 22.

ZONIFICACIÓN Y USO DE SUELO:
- Clave de Uso de Suelo: H2 / Habitacional de Densidad Media.
- Altura Máxima Permitida: 2 niveles o 9 metros de altura máxima desde nivel medio de banqueta.
- Coeficiente de Ocupación del Suelo (COS): 0.60 (Superficie de desplante máxima: 270.00 m²).
- Coeficiente de Utilización del Suelo (CUS): 1.20 (Superficie total de construcción máxima: 540.00 m²).
- Restricción de Frente (Jardín frontal obligatorio): 3.00 metros de separación.
- Restricción Posterior: 2.00 metros de jardín de amortiguamiento.

RESTRICCIONES Y GRAVÁMENES URBANOS:
Se reporta el paso de servidumbre de paso aérea de media tensión eléctrica propiedad de CFE en el lindero posterior, ocupando una franja no edificable de 2.50 metros de ancho a todo lo largo del fondo. No se permite la edificación de estructuras techadas o de mampostería pesada bajo dicha franja de servidumbre, debiendo permanecer como área permeable y jardín abierto.`,
    analysis: {
      summary: 'Plano técnico y de zonificación municipal para el Lote 14 en El Mirador, Querétaro. Predio habitacional de 450m² con uso de suelo H2 (máximo 2 niveles, COS 0.60, CUS 1.20). Incluye restricción crítica de construcción: servidumbre de paso aérea de CFE de 2.5 metros en la colindancia posterior donde se prohíbe edificar.',
      legalRiskSummary: 'Este plano técnico y de zonificación municipal revela un perfil de riesgo constructivo y de desarrollo ALTO. Existe una servidumbre de paso aérea de media tensión eléctrica propiedad de la Comisión Federal de Electricidad (CFE) en el lindero posterior, la cual afecta una franja no edificable de 2.50 metros de ancho por todo el fondo del predio. Construir cualquier estructura techada o mampostería pesada bajo esta franja es ilegal y expone al propietario a demolición forzada y multas federales. Esto limita de forma efectiva el área aprovechable del predio. Se recomienda adecuar el proyecto arquitectónico para que dicha sección se mantenga exclusivamente como jardín permeable o área de retiro abierta.',
      entities: {
        buyerOrTenant: 'N/A (Propietario de consulta)',
        sellerOrLandlord: 'N/A',
        notary: 'Dirección de Desarrollo Urbano Querétaro',
        propertyAddress: 'Lote 14, Manzana 3, Sección Bosques, Fraccionamiento El Mirador, El Marqués, Querétaro',
        cadastralKey: 'QRO-EM-003-014'
      },
      metrics: {
        surfaceArea: '450.00 m²',
        transactionAmount: 'N/A (Documento técnico)',
        currency: 'N/A',
        duration: 'Vigencia de alineamiento y número oficial: 24 meses'
      },
      dates: {
        signingDate: '2025-11-20',
        expirationDate: '2027-11-20',
        registrationDate: '2025-11-24'
      },
      keyClauses: [
        {
          title: 'Servidumbre de Paso CFE (Restricción Posterior)',
          summary: 'Franja de restricción de construcción de 2.5 metros de ancho al fondo del terreno por cableado de media tensión.',
          risk: 'high',
          riskExplanation: 'Reduce el área edificable real en 37.5 m² (15m x 2.5m). Construir bajo esta franja es ilegal y expone al propietario a demolición forzada y multas federales.'
        },
        {
          title: 'Uso de Suelo H2 y Densidades',
          summary: 'Límite de edificación a 2 niveles (9 metros de altura) con COS de 0.60 y CUS de 1.20.',
          risk: 'low',
          riskExplanation: 'Restricciones habituales de fraccionamiento residencial ordenado.'
        }
      ],
      alerts: [
        {
          type: 'critical',
          message: 'Existe servidumbre de paso aérea de media tensión CFE de 2.5m en colindancia trasera. Área estrictamente no edificable.'
        },
        {
          type: 'info',
          message: 'Uso de suelo residencial unifamiliar H2 en regla.'
        }
      ],
      criticalDeadlines: [
        {
          title: "Presentación de Licencia de Construcción",
          date: "2026-11-20",
          description: "Plazo máximo sugerido de 12 meses para ingresar planos de obra y memoria de cálculo estructural ante Desarrollo Urbano municipal.",
          priority: "high"
        },
        {
          title: "Vencimiento de Alineamiento y Número Oficial",
          date: "2027-11-20",
          description: "Periodo de validez legal de la constancia de zonificación municipal (24 meses). Pasado este plazo, se debe solicitar prórroga de vigencia previa al inicio de obras.",
          priority: "medium"
        }
      ],
      ocrExtracted: true,
      ocrMethodUsed: 'Gemini Multimodal Computer Vision Engine (Análisis directo de imagen)',
      extractedText: `TRANSCRIPCIÓN COMPLETA DEL RECONOCIMIENTO VECTORIAL Y OCR (PLANO DE ZONIFICACIÓN):

FICHA TÉCNICA CATASTRAL Y DESCRIPCIÓN DE PLANO DE ZONIFICACIÓN
Departamento de Desarrollo Urbano del Municipio de El Marqués, Querétaro.
Identificador de Predio: Lote 14, Manzana 3, Sección Bosques, Fraccionamiento "El Mirador".

DATOS TÉCNICOS TRANSCRITOS:
- Superficie Total del Terreno: 450.00 metros cuadrados.
- Frente: 15.00 metros sobre Calle de los Crisantemos.
- Fondo: 30.00 metros colindando con Lote Privado 22.

ZONIFICACIÓN Y USO DE SUELO REGISTRADO:
- Clave de Uso de Suelo: H2 / Habitacional de Densidad Media.
- Altura Máxima Permitida: 2 niveles o 9 metros de altura máxima desde nivel medio de banqueta.
- Coeficiente de Ocupación del Suelo (COS): 0.60 (Superficie de desplante máxima: 270.00 m²).
- Coeficiente de Utilización del Suelo (CUS): 1.20 (Superficie total de construcción máxima: 540.00 m²).
- Restricción de Frente (Jardín frontal obligatorio): 3.00 metros de separación.
- Restricción Posterior: 2.00 metros de jardín de amortiguamiento.

DETALLES DE SERVIDUMBRE Y RESTRICCIONES FEDERALES (EXTRACTO DEL RECUADRO INFERIOR DERECHO DEL PLANO):
"Se reporta el paso de servidumbre de paso aérea de media tensión eléctrica propiedad de la Comisión Federal de Electricidad (CFE) en el lindero posterior del Lote 14, ocupando una franja rígida no edificable de 2.50 metros de ancho por todo el fondo (37.50 m² de afectación constructiva). Queda estrictamente prohibida la edificación de estructuras techadas o de mampostería pesada bajo dicha franja de servidumbre, debiendo permanecer como área permeable y jardín abierto para facilidades de mantenimiento federal."

FIN DE LA TRANSCRIPCIÓN DEL PLANO.`
    }
  }
];
