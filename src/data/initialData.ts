import { AppData } from '../types';

export const INITIAL_DATA: AppData = {
  "proyectos": [
    {
      "id": "proj_4ky860",
      "nombre": "Cabinas Filtro Prensa VEL",
      "empresas": [
        {
          "id": "emp_taging",
          "nombre": "VEL",
          "color": "blue"
        }
      ],
      "entregables": [
        {
          "empresaId": "emp_taging",
          "codigo": "B1.0001.01",
          "descripcion": "visita a sitio",
          "categoria": "Ingenieria",
          "valorTotal": 5184,
          "fechaBase": "2026-06-05",
          "tipoDistribucion": "pago_unico",
          "porcentajes": {
            "emisionB": 60,
            "emision0": 30,
            "restante": 10
          },
          "intervaloCert": 0,
          "diasRevision": 0,
          "fechaFinProyecto": "0001-01-01",
          "hitos": [
            {
              "id": "id_0ib9v41d7vyb",
              "nombre": "Pago único",
              "porcentaje": 100,
              "reglaFecha": "pago_unico",
              "diasAdicionales": 0,
              "certificados": [
                {
                  "id": "id_0pu06aqhwml0",
                  "grupo": "id_w44jzafswml0",
                  "nombre": "1",
                  "numero": "1",
                  "ordenCompra": "",
                  "fechaPresentacion": "2026-06-08",
                  "fechaAprobacion": "2026-06-08",
                  "fechaCobro": "2026-06-08",
                  "importe": 6623.818181818182,
                  "tipo": "normal",
                  "estado": "Cobrado",
                  "observaciones": ""
                }
              ]
            }
          ],
          "incluirCurva": true,
          "esCHO": false,
          "ordenCompra": "4501465872",
          "observaciones": "",
          "id": "id_39ysxpsyxzb5",
          "empresa": "raybite"
        },
        {
          "empresaId": "emp_taging",
          "codigo": "B2.0002.01",
          "descripcion": "Planos de distribución Eléctrica",
          "categoria": "Ingenieria",
          "valorTotal": 4320,
          "fechaBase": "2026-09-14",
          "tipoDistribucion": "estandar",
          "porcentajes": {
            "emisionB": 60,
            "emision0": 30,
            "restante": 10
          },
          "intervaloCert": 15,
          "diasRevision": 3,
          "fechaFinProyecto": "2026-12-31",
          "hitos": [
            {
              "id": "id_dnz4k6hee9vv",
              "nombre": "Emisión B",
              "porcentaje": 60,
              "reglaFecha": "emision_b",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_z5gdrko7e9vv",
              "nombre": "Emisión 0",
              "porcentaje": 30,
              "reglaFecha": "emision_0",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_gtpug03oe9vv",
              "nombre": "Restante Final",
              "porcentaje": 10,
              "reglaFecha": "cierre",
              "diasAdicionales": 0,
              "certificados": []
            }
          ],
          "incluirCurva": true,
          "esCHO": false,
          "ordenCompra": "4501465872",
          "observaciones": "",
          "id": "id_9eg1ztwnxzb5",
          "empresa": "raybite"
        },
        {
          "empresaId": "emp_taging",
          "codigo": "B2.0001.01",
          "descripcion": "Memoria de Cálculo de caudales de Inyección de Aire",
          "categoria": "Ingenieria",
          "valorTotal": 6210,
          "fechaBase": "2026-06-19",
          "tipoDistribucion": "estandar",
          "porcentajes": {
            "emisionB": 60,
            "emision0": 30,
            "restante": 10
          },
          "intervaloCert": 15,
          "diasRevision": 5,
          "fechaFinProyecto": "2026-12-31",
          "hitos": [
            {
              "id": "id_u7fchfsye9vv",
              "nombre": "Emisión B",
              "porcentaje": 60,
              "reglaFecha": "emision_b",
              "diasAdicionales": 0,
              "certificados": [
                {
                  "id": "id_ywo5o2c4y6dc",
                  "grupo": "id_xtl14p12y6dc",
                  "nombre": "Certificado 2",
                  "numero": "2",
                  "ordenCompra": "",
                  "fechaPresentacion": "0026-06-26",
                  "fechaAprobacion": "2026-06-26",
                  "fechaCobro": "2026-06-26",
                  "importe": 4589.890909090909,
                  "tipo": "normal",
                  "estado": "Cobrado",
                  "observaciones": ""
                }
              ]
            },
            {
              "id": "id_pezlp04ne9vv",
              "nombre": "Emisión 0",
              "porcentaje": 30,
              "reglaFecha": "emision_0",
              "diasAdicionales": 0,
              "certificados": [
                {
                  "id": "id_w7as6i4hzrp5",
                  "grupo": "id_2wzuvznzzrp5",
                  "nombre": "Certificado 3",
                  "numero": "3",
                  "ordenCompra": "",
                  "fechaPresentacion": "2026-07-10",
                  "fechaAprobacion": "2026-07-10",
                  "fechaCobro": "2026-07-10",
                  "importe": 2294.9454545454546,
                  "tipo": "normal",
                  "estado": "Cobrado",
                  "observaciones": ""
                }
              ]
            },
            {
              "id": "id_fgouprife9vv",
              "nombre": "Restante Final",
              "porcentaje": 10,
              "reglaFecha": "cierre",
              "diasAdicionales": 0,
              "certificados": []
            }
          ],
          "incluirCurva": true,
          "esCHO": false,
          "ordenCompra": "4501465872",
          "observaciones": "",
          "id": "id_gvmur2ple9vv"
        },
        {
          "empresaId": "emp_taging",
          "codigo": "B2.0001.02",
          "descripcion": "Memoria de Cálculo de Vapores a Evacuar",
          "categoria": "Ingenieria",
          "valorTotal": 6156,
          "fechaBase": "2026-06-19",
          "tipoDistribucion": "estandar",
          "porcentajes": {
            "emisionB": 60,
            "emision0": 30,
            "restante": 10
          },
          "intervaloCert": 15,
          "diasRevision": 5,
          "fechaFinProyecto": "2026-12-31",
          "hitos": [
            {
              "id": "id_zin9szyue9vv",
              "nombre": "Emisión B",
              "porcentaje": 60,
              "reglaFecha": "emision_b",
              "diasAdicionales": 0,
              "certificados": [
                {
                  "id": "id_bqz2g8pny6dc",
                  "grupo": "id_xtl14p12y6dc",
                  "nombre": "Certificado 2",
                  "numero": "2",
                  "ordenCompra": "",
                  "fechaPresentacion": "0026-06-26",
                  "fechaAprobacion": "2026-06-26",
                  "fechaCobro": "2026-06-26",
                  "importe": 4557.490909090909,
                  "tipo": "normal",
                  "estado": "Cobrado",
                  "observaciones": ""
                }
              ]
            },
            {
              "id": "id_styxj7xge9vv",
              "nombre": "Emisión 0",
              "porcentaje": 30,
              "reglaFecha": "emision_0",
              "diasAdicionales": 0,
              "certificados": [
                {
                  "id": "id_zohp8vw0zrp5",
                  "grupo": "id_2wzuvznzzrp5",
                  "nombre": "Certificado 3",
                  "numero": "3",
                  "ordenCompra": "",
                  "fechaPresentacion": "2026-07-10",
                  "fechaAprobacion": "2026-07-10",
                  "fechaCobro": "2026-07-10",
                  "importe": 2278.7454545454543,
                  "tipo": "normal",
                  "estado": "Cobrado",
                  "observaciones": ""
                }
              ]
            },
            {
              "id": "id_jrvv0y65e9vv",
              "nombre": "Restante Final",
              "porcentaje": 10,
              "reglaFecha": "cierre",
              "diasAdicionales": 0,
              "certificados": []
            }
          ],
          "incluirCurva": true,
          "esCHO": false,
          "ordenCompra": "4501465872",
          "observaciones": "",
          "id": "id_9ixn1u07e9vv"
        },
        {
          "empresaId": "emp_taging",
          "codigo": "B1.0001.02",
          "descripcion": "Escaneo Laser ",
          "categoria": "Ingenieria",
          "valorTotal": 12960,
          "fechaBase": "2026-07-12",
          "tipoDistribucion": "pago_unico",
          "porcentajes": {
            "emisionB": 100,
            "emision0": 0,
            "restante": 10
          },
          "intervaloCert": 0,
          "diasRevision": 5,
          "fechaFinProyecto": "",
          "hitos": [
            {
              "id": "id_zntj0zli4dy3",
              "nombre": "Pago único",
              "porcentaje": 100,
              "reglaFecha": "pago_unico",
              "diasAdicionales": 0,
              "certificados": [
                {
                  "id": "id_3jyi35w7zrp5",
                  "grupo": "id_2wzuvznzzrp5",
                  "nombre": "Certificado 3",
                  "numero": "3",
                  "ordenCompra": "",
                  "fechaPresentacion": "2026-07-10",
                  "fechaAprobacion": "2026-07-10",
                  "fechaCobro": "2026-07-10",
                  "importe": 14399.818181818182,
                  "tipo": "normal",
                  "estado": "Cobrado",
                  "observaciones": ""
                }
              ]
            }
          ],
          "incluirCurva": true,
          "esCHO": false,
          "ordenCompra": "4501465872",
          "observaciones": "",
          "id": "id_l82aagm3e9vv"
        },
        {
          "empresaId": "emp_taging",
          "codigo": "B2.0001.09",
          "descripcion": "Especificaciones Técnicas para Ductos",
          "categoria": "Ingenieria",
          "valorTotal": 3240,
          "fechaBase": "2026-08-22",
          "tipoDistribucion": "estandar",
          "porcentajes": {
            "emisionB": 60,
            "emision0": 30,
            "restante": 10
          },
          "intervaloCert": 15,
          "diasRevision": 5,
          "fechaFinProyecto": "2026-12-31",
          "hitos": [
            {
              "id": "id_e68fo9i4e9vv",
              "nombre": "Emisión B",
              "porcentaje": 60,
              "reglaFecha": "emision_b",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_v5ntmbz6e9vv",
              "nombre": "Emisión 0",
              "porcentaje": 30,
              "reglaFecha": "emision_0",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_pzcddqv3e9vv",
              "nombre": "Restante Final",
              "porcentaje": 10,
              "reglaFecha": "cierre",
              "diasAdicionales": 0,
              "certificados": []
            }
          ],
          "incluirCurva": true,
          "esCHO": false,
          "ordenCompra": "4501465872",
          "observaciones": "",
          "id": "id_4tiynic2e9vv"
        },
        {
          "empresaId": "emp_taging",
          "codigo": "B2.0001.08",
          "descripcion": "Plano de desmontaje",
          "categoria": "Ingenieria",
          "valorTotal": 3240,
          "fechaBase": "2026-08-24",
          "tipoDistribucion": "estandar",
          "porcentajes": {
            "emisionB": 60,
            "emision0": 30,
            "restante": 10
          },
          "intervaloCert": 15,
          "diasRevision": 5,
          "fechaFinProyecto": "2026-12-31",
          "hitos": [
            {
              "id": "id_2mu8zcibe9vv",
              "nombre": "Emisión B",
              "porcentaje": 60,
              "reglaFecha": "emision_b",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_z8w3xozke9vv",
              "nombre": "Emisión 0",
              "porcentaje": 30,
              "reglaFecha": "emision_0",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_4a2yfl8ge9vv",
              "nombre": "Restante Final",
              "porcentaje": 10,
              "reglaFecha": "cierre",
              "diasAdicionales": 0,
              "certificados": []
            }
          ],
          "incluirCurva": true,
          "esCHO": false,
          "ordenCompra": "4501465872",
          "observaciones": "",
          "id": "id_bfwfd9nwe9vv"
        },
        {
          "empresaId": "emp_taging",
          "codigo": "B2.0001.03",
          "descripcion": "Memoria de Cálculo Dimensionamiento de Ductos de Inyección",
          "categoria": "Ingenieria",
          "valorTotal": 3780,
          "fechaBase": "2026-08-28",
          "tipoDistribucion": "estandar",
          "porcentajes": {
            "emisionB": 60,
            "emision0": 30,
            "restante": 10
          },
          "intervaloCert": 15,
          "diasRevision": 5,
          "fechaFinProyecto": "2026-12-31",
          "hitos": [
            {
              "id": "id_5kty3n2qe9vv",
              "nombre": "Emisión B",
              "porcentaje": 60,
              "reglaFecha": "emision_b",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_htfuwbz6e9vv",
              "nombre": "Emisión 0",
              "porcentaje": 30,
              "reglaFecha": "emision_0",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_n580sjxte9vv",
              "nombre": "Restante Final",
              "porcentaje": 10,
              "reglaFecha": "cierre",
              "diasAdicionales": 0,
              "certificados": []
            }
          ],
          "incluirCurva": true,
          "esCHO": false,
          "ordenCompra": "4501465872",
          "observaciones": "",
          "id": "id_f3m2nzkle9vv"
        },
        {
          "empresaId": "emp_taging",
          "codigo": "B2.0001.04",
          "descripcion": "Memoria de Cálculo Dimensionamiento de Ductos de Extracción",
          "categoria": "Ingenieria",
          "valorTotal": 3780,
          "fechaBase": "2026-08-30",
          "tipoDistribucion": "estandar",
          "porcentajes": {
            "emisionB": 60,
            "emision0": 30,
            "restante": 10
          },
          "intervaloCert": 15,
          "diasRevision": 5,
          "fechaFinProyecto": "2026-12-31",
          "hitos": [
            {
              "id": "id_kfqqwb09e9vv",
              "nombre": "Emisión B",
              "porcentaje": 60,
              "reglaFecha": "emision_b",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_dhh2gwmwe9vv",
              "nombre": "Emisión 0",
              "porcentaje": 30,
              "reglaFecha": "emision_0",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_cnq7wg5de9vv",
              "nombre": "Restante Final",
              "porcentaje": 10,
              "reglaFecha": "cierre",
              "diasAdicionales": 0,
              "certificados": []
            }
          ],
          "incluirCurva": true,
          "esCHO": false,
          "ordenCompra": "4501465872",
          "observaciones": "",
          "id": "id_j7uek5b1e9vv"
        },
        {
          "empresaId": "emp_taging",
          "codigo": "B2.0001.05",
          "descripcion": "Planos de Distribución de equipos, racks y estructuras de soporte",
          "categoria": "Ingenieria",
          "valorTotal": 4320,
          "fechaBase": "2026-09-03",
          "tipoDistribucion": "estandar",
          "porcentajes": {
            "emisionB": 60,
            "emision0": 30,
            "restante": 10
          },
          "intervaloCert": 15,
          "diasRevision": 5,
          "fechaFinProyecto": "2026-12-31",
          "hitos": [
            {
              "id": "id_xr85lfm7e9vv",
              "nombre": "Emisión B",
              "porcentaje": 60,
              "reglaFecha": "emision_b",
              "diasAdicionales": 0,
              "certificados": [],
              "fechaManual": "2026-09-03"
            },
            {
              "id": "id_1oslozj1e9vv",
              "nombre": "Emisión 0",
              "porcentaje": 30,
              "reglaFecha": "emision_0",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_sdfbshune9vv",
              "nombre": "Restante Final",
              "porcentaje": 10,
              "reglaFecha": "cierre",
              "diasAdicionales": 0,
              "certificados": []
            }
          ],
          "incluirCurva": true,
          "esCHO": false,
          "ordenCompra": "4501465872",
          "observaciones": "",
          "id": "id_55efk84we9vv"
        },
        {
          "empresaId": "emp_taging",
          "codigo": "B2.0001.06",
          "descripcion": "Planos de recorrido y distribución ductos ",
          "categoria": "Ingenieria",
          "valorTotal": 4320,
          "fechaBase": "2026-09-06",
          "tipoDistribucion": "estandar",
          "porcentajes": {
            "emisionB": 60,
            "emision0": 30,
            "restante": 10
          },
          "intervaloCert": 15,
          "diasRevision": 5,
          "fechaFinProyecto": "2026-12-31",
          "hitos": [
            {
              "id": "id_mhf0plmpe9vv",
              "nombre": "Emisión B",
              "porcentaje": 60,
              "reglaFecha": "emision_b",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_p8ah7fqpe9vv",
              "nombre": "Emisión 0",
              "porcentaje": 30,
              "reglaFecha": "emision_0",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_w24paxdue9vv",
              "nombre": "Restante Final",
              "porcentaje": 10,
              "reglaFecha": "cierre",
              "diasAdicionales": 0,
              "certificados": []
            }
          ],
          "incluirCurva": true,
          "esCHO": false,
          "ordenCompra": "4501465872",
          "observaciones": "",
          "id": "id_uczvh4rle9vv"
        },
        {
          "empresaId": "emp_taging",
          "codigo": "B1.0001.03",
          "descripcion": "Maqueta 3D",
          "categoria": "Ingenieria",
          "valorTotal": 10530,
          "fechaBase": "2026-09-06",
          "tipoDistribucion": "estandar",
          "porcentajes": {
            "emisionB": 60,
            "emision0": 30,
            "restante": 10
          },
          "intervaloCert": 15,
          "diasRevision": 21,
          "fechaFinProyecto": "2026-12-31",
          "hitos": [
            {
              "id": "id_2a8nl1qwe9vv",
              "nombre": "Emisión B",
              "porcentaje": 60,
              "reglaFecha": "emision_b",
              "diasAdicionales": 0,
              "certificados": [
                {
                  "id": "id_vokoxqmg4w3i",
                  "grupo": "id_9o8bkxru4w3i",
                  "nombre": "Certificado 6",
                  "numero": "6",
                  "ordenCompra": "",
                  "fechaPresentacion": "2026-09-02",
                  "fechaAprobacion": "2026-09-02",
                  "fechaCobro": "2026-09-02",
                  "importe": 7181.890909090909,
                  "tipo": "normal",
                  "estado": "Cobrado",
                  "observaciones": ""
                }
              ]
            },
            {
              "id": "id_a7uuy0ace9vv",
              "nombre": "Emisión 0",
              "porcentaje": 30,
              "reglaFecha": "emision_0",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_d08prizqe9vv",
              "nombre": "Restante Final",
              "porcentaje": 10,
              "reglaFecha": "cierre",
              "diasAdicionales": 0,
              "certificados": []
            }
          ],
          "incluirCurva": true,
          "esCHO": false,
          "ordenCompra": "4501465872",
          "observaciones": "",
          "id": "id_e2766s1de9vv"
        },
        {
          "empresaId": "emp_taging",
          "codigo": "B2.0001.07",
          "descripcion": "Plano costructivo difusor",
          "categoria": "Ingenieria",
          "valorTotal": 4320,
          "fechaBase": "2026-09-09",
          "tipoDistribucion": "estandar",
          "porcentajes": {
            "emisionB": 60,
            "emision0": 30,
            "restante": 10
          },
          "intervaloCert": 15,
          "diasRevision": 5,
          "fechaFinProyecto": "2026-12-31",
          "hitos": [
            {
              "id": "id_p8rjzazje9vv",
              "nombre": "Emisión B",
              "porcentaje": 60,
              "reglaFecha": "emision_b",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_4ffv1dcne9vv",
              "nombre": "Emisión 0",
              "porcentaje": 30,
              "reglaFecha": "emision_0",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_lxwer58fe9vv",
              "nombre": "Restante Final",
              "porcentaje": 10,
              "reglaFecha": "cierre",
              "diasAdicionales": 0,
              "certificados": []
            }
          ],
          "incluirCurva": true,
          "esCHO": false,
          "ordenCompra": "4501465872",
          "observaciones": "",
          "id": "id_vdpmdxgve9vv"
        },
        {
          "empresaId": "emp_taging",
          "codigo": "B2.0001.10",
          "descripcion": "Cómputo de Materiales Sist. de Inyección de Aires y Ext. de vapores",
          "categoria": "Ingenieria",
          "valorTotal": 2700,
          "fechaBase": "2026-09-11",
          "tipoDistribucion": "estandar",
          "porcentajes": {
            "emisionB": 60,
            "emision0": 30,
            "restante": 10
          },
          "intervaloCert": 15,
          "diasRevision": 5,
          "fechaFinProyecto": "2026-12-31",
          "hitos": [
            {
              "id": "id_u90xx5pge9vv",
              "nombre": "Emisión B",
              "porcentaje": 60,
              "reglaFecha": "emision_b",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_8oir7xrfe9vv",
              "nombre": "Emisión 0",
              "porcentaje": 30,
              "reglaFecha": "emision_0",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_l3ord1r8e9vv",
              "nombre": "Restante Final",
              "porcentaje": 10,
              "reglaFecha": "cierre",
              "diasAdicionales": 0,
              "certificados": []
            }
          ],
          "incluirCurva": true,
          "esCHO": false,
          "ordenCompra": "4501465872",
          "observaciones": "",
          "id": "id_cgocti26e9vv"
        },
        {
          "empresaId": "emp_taging",
          "codigo": "B2.0001.12",
          "descripcion": "PFD Diagrama de flujo   conexión a DCS 2",
          "categoria": "Ingenieria",
          "valorTotal": 1296,
          "fechaBase": "2026-09-11",
          "tipoDistribucion": "estandar",
          "porcentajes": {
            "emisionB": 60,
            "emision0": 30,
            "restante": 10
          },
          "intervaloCert": 15,
          "diasRevision": 5,
          "fechaFinProyecto": "2026-12-31",
          "hitos": [
            {
              "id": "id_x8dzzsqee9vv",
              "nombre": "Emisión B",
              "porcentaje": 60,
              "reglaFecha": "emision_b",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_gfr6h5wve9vv",
              "nombre": "Emisión 0",
              "porcentaje": 30,
              "reglaFecha": "emision_0",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_jeqz3fa3e9vv",
              "nombre": "Restante Final",
              "porcentaje": 10,
              "reglaFecha": "cierre",
              "diasAdicionales": 0,
              "certificados": []
            }
          ],
          "incluirCurva": true,
          "esCHO": false,
          "ordenCompra": "4501465872",
          "observaciones": "",
          "id": "id_jnleme4qe9vv"
        },
        {
          "empresaId": "emp_taging",
          "codigo": "B2.0001.13",
          "descripcion": "P&ID conexión a DCS 2",
          "categoria": "Ingenieria",
          "valorTotal": 2160,
          "fechaBase": "2026-09-11",
          "tipoDistribucion": "estandar",
          "porcentajes": {
            "emisionB": 60,
            "emision0": 30,
            "restante": 10
          },
          "intervaloCert": 15,
          "diasRevision": 21,
          "fechaFinProyecto": "2026-12-31",
          "hitos": [
            {
              "id": "id_libtbfhxe9vv",
              "nombre": "Emisión B",
              "porcentaje": 60,
              "reglaFecha": "emision_b",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_hw4bxsdce9vv",
              "nombre": "Emisión 0",
              "porcentaje": 30,
              "reglaFecha": "emision_0",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_knvqqat7e9vv",
              "nombre": "Restante Final",
              "porcentaje": 10,
              "reglaFecha": "cierre",
              "diasAdicionales": 0,
              "certificados": []
            }
          ],
          "incluirCurva": true,
          "esCHO": false,
          "ordenCompra": "4501465872",
          "observaciones": "",
          "id": "id_5jkqry61e9vv"
        },
        {
          "empresaId": "emp_taging",
          "codigo": "B2.0002.02",
          "descripcion": "Planos de iluminación interna de cabinas",
          "categoria": "Ingenieria",
          "valorTotal": 4320,
          "fechaBase": "2026-09-14",
          "tipoDistribucion": "estandar",
          "porcentajes": {
            "emisionB": 60,
            "emision0": 30,
            "restante": 10
          },
          "intervaloCert": 15,
          "diasRevision": 5,
          "fechaFinProyecto": "2026-12-31",
          "hitos": [
            {
              "id": "id_v67pzu6ye9vv",
              "nombre": "Emisión B",
              "porcentaje": 60,
              "reglaFecha": "emision_b",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_wc1on2jke9vv",
              "nombre": "Emisión 0",
              "porcentaje": 30,
              "reglaFecha": "emision_0",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_5hqbfncpe9vv",
              "nombre": "Restante Final",
              "porcentaje": 10,
              "reglaFecha": "cierre",
              "diasAdicionales": 0,
              "certificados": []
            }
          ],
          "incluirCurva": true,
          "esCHO": false,
          "ordenCompra": "4501465872",
          "observaciones": "",
          "id": "id_vzpoznu1e9vv"
        },
        {
          "empresaId": "emp_taging",
          "codigo": "B2.0002.07",
          "descripcion": "Memoria de Calculo Iluminacion interior Cabinas",
          "categoria": "Ingenieria",
          "valorTotal": 3240,
          "fechaBase": "2026-09-14",
          "tipoDistribucion": "estandar",
          "porcentajes": {
            "emisionB": 60,
            "emision0": 30,
            "restante": 10
          },
          "intervaloCert": 15,
          "diasRevision": 5,
          "fechaFinProyecto": "2026-12-31",
          "hitos": [
            {
              "id": "id_p7juh9w7e9vv",
              "nombre": "Emisión B",
              "porcentaje": 60,
              "reglaFecha": "emision_b",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_aygli2k9e9vv",
              "nombre": "Emisión 0",
              "porcentaje": 30,
              "reglaFecha": "emision_0",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_1pjqctnze9vv",
              "nombre": "Restante Final",
              "porcentaje": 10,
              "reglaFecha": "cierre",
              "diasAdicionales": 0,
              "certificados": []
            }
          ],
          "incluirCurva": true,
          "esCHO": false,
          "ordenCompra": "4501465872",
          "observaciones": "",
          "id": "id_7h6pg0a4e9vv"
        },
        {
          "empresaId": "emp_taging",
          "codigo": "B2.0001.11",
          "descripcion": "Filosofía de operación y control",
          "categoria": "Ingenieria",
          "valorTotal": 864,
          "fechaBase": "2026-10-06",
          "tipoDistribucion": "estandar",
          "porcentajes": {
            "emisionB": 60,
            "emision0": 30,
            "restante": 10
          },
          "intervaloCert": 15,
          "diasRevision": 5,
          "fechaFinProyecto": "2026-12-31",
          "hitos": [
            {
              "id": "id_psqixvike9vv",
              "nombre": "Emisión B",
              "porcentaje": 60,
              "reglaFecha": "emision_b",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_6r6g7wtoe9vv",
              "nombre": "Emisión 0",
              "porcentaje": 30,
              "reglaFecha": "emision_0",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_kk5m7qjje9vv",
              "nombre": "Restante Final",
              "porcentaje": 10,
              "reglaFecha": "cierre",
              "diasAdicionales": 0,
              "certificados": []
            }
          ],
          "incluirCurva": true,
          "esCHO": false,
          "ordenCompra": "4501465872",
          "observaciones": "",
          "id": "id_7cacyxxoe9vv"
        },
        {
          "empresaId": "emp_taging",
          "codigo": "B2.0002.03",
          "descripcion": "Lista de cables",
          "categoria": "Ingenieria",
          "valorTotal": 2160,
          "fechaBase": "2026-10-16",
          "tipoDistribucion": "estandar",
          "porcentajes": {
            "emisionB": 60,
            "emision0": 30,
            "restante": 10
          },
          "intervaloCert": 15,
          "diasRevision": 5,
          "fechaFinProyecto": "2026-12-31",
          "hitos": [
            {
              "id": "id_fr5d0u5ke9vv",
              "nombre": "Emisión B",
              "porcentaje": 60,
              "reglaFecha": "emision_b",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_yr3exqyle9vv",
              "nombre": "Emisión 0",
              "porcentaje": 30,
              "reglaFecha": "emision_0",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_jzz4ghzie9vv",
              "nombre": "Restante Final",
              "porcentaje": 10,
              "reglaFecha": "cierre",
              "diasAdicionales": 0,
              "certificados": []
            }
          ],
          "incluirCurva": true,
          "esCHO": false,
          "ordenCompra": "4501465872",
          "observaciones": "",
          "id": "id_q16exbmie9vv"
        },
        {
          "empresaId": "emp_taging",
          "codigo": "B2.0003.01",
          "descripcion": "Mem. de Cálculo de Estuct.  soporte de Equipos y soportes especiales",
          "categoria": "Ingenieria",
          "valorTotal": 4320,
          "fechaBase": "2026-10-17",
          "tipoDistribucion": "estandar",
          "porcentajes": {
            "emisionB": 60,
            "emision0": 30,
            "restante": 10
          },
          "intervaloCert": 15,
          "diasRevision": 5,
          "fechaFinProyecto": "2026-12-31",
          "hitos": [
            {
              "id": "id_vq5po9bhe9vv",
              "nombre": "Emisión B",
              "porcentaje": 60,
              "reglaFecha": "emision_b",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_a2qlqrqre9vv",
              "nombre": "Emisión 0",
              "porcentaje": 30,
              "reglaFecha": "emision_0",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_5k5l3asse9vv",
              "nombre": "Restante Final",
              "porcentaje": 10,
              "reglaFecha": "cierre",
              "diasAdicionales": 0,
              "certificados": []
            }
          ],
          "incluirCurva": true,
          "esCHO": false,
          "ordenCompra": "4501465872",
          "observaciones": "",
          "id": "id_pyevm1mwe9vv"
        },
        {
          "empresaId": "emp_taging",
          "codigo": "B2.0003.03",
          "descripcion": "Planos Estructuras metalicas de soporte de Equipos y soportes",
          "categoria": "Ingenieria",
          "valorTotal": 4320,
          "fechaBase": "2026-10-17",
          "tipoDistribucion": "estandar",
          "porcentajes": {
            "emisionB": 60,
            "emision0": 30,
            "restante": 10
          },
          "intervaloCert": 15,
          "diasRevision": 5,
          "fechaFinProyecto": "2026-12-31",
          "hitos": [
            {
              "id": "id_e9xqog76e9vv",
              "nombre": "Emisión B",
              "porcentaje": 60,
              "reglaFecha": "emision_b",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_f6e0yyz7e9vv",
              "nombre": "Emisión 0",
              "porcentaje": 30,
              "reglaFecha": "emision_0",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_7uexzcdue9vv",
              "nombre": "Restante Final",
              "porcentaje": 10,
              "reglaFecha": "cierre",
              "diasAdicionales": 0,
              "certificados": []
            }
          ],
          "incluirCurva": true,
          "esCHO": false,
          "ordenCompra": "4501465872",
          "observaciones": "",
          "id": "id_8ow7ygn0e9vv"
        },
        {
          "empresaId": "emp_taging",
          "codigo": "B2.0002.04",
          "descripcion": "Tipicos de montaje",
          "categoria": "Ingenieria",
          "valorTotal": 2160,
          "fechaBase": "2026-10-18",
          "tipoDistribucion": "estandar",
          "porcentajes": {
            "emisionB": 60,
            "emision0": 30,
            "restante": 10
          },
          "intervaloCert": 15,
          "diasRevision": 5,
          "fechaFinProyecto": "2026-12-31",
          "hitos": [
            {
              "id": "id_6ofwz20se9vv",
              "nombre": "Emisión B",
              "porcentaje": 60,
              "reglaFecha": "emision_b",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_zet7gwy5e9vv",
              "nombre": "Emisión 0",
              "porcentaje": 30,
              "reglaFecha": "emision_0",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_3yfxuty7e9vv",
              "nombre": "Restante Final",
              "porcentaje": 10,
              "reglaFecha": "cierre",
              "diasAdicionales": 0,
              "certificados": []
            }
          ],
          "incluirCurva": true,
          "esCHO": false,
          "ordenCompra": "4501465872",
          "observaciones": "",
          "id": "id_c2m59ehfe9vv"
        },
        {
          "empresaId": "emp_taging",
          "codigo": "B2.0002.06",
          "descripcion": "Cómputos Métricos de las Instalación eléctrica",
          "categoria": "Ingenieria",
          "valorTotal": 2160,
          "fechaBase": "2026-10-21",
          "tipoDistribucion": "estandar",
          "porcentajes": {
            "emisionB": 60,
            "emision0": 30,
            "restante": 10
          },
          "intervaloCert": 15,
          "diasRevision": 5,
          "fechaFinProyecto": "2026-12-31",
          "hitos": [
            {
              "id": "id_08tfh404e9vv",
              "nombre": "Emisión B",
              "porcentaje": 60,
              "reglaFecha": "emision_b",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_t8om17ude9vv",
              "nombre": "Emisión 0",
              "porcentaje": 30,
              "reglaFecha": "emision_0",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_rp0nr8p6e9vv",
              "nombre": "Restante Final",
              "porcentaje": 10,
              "reglaFecha": "cierre",
              "diasAdicionales": 0,
              "certificados": []
            }
          ],
          "incluirCurva": true,
          "esCHO": false,
          "ordenCompra": "4501465872",
          "observaciones": "",
          "id": "id_g24ld30ve9vv"
        },
        {
          "empresaId": "emp_taging",
          "codigo": "B2.0002.05",
          "descripcion": "Especificaciones técnicas de la Instalación Eléctrica",
          "categoria": "Ingenieria",
          "valorTotal": 2160,
          "fechaBase": "2026-10-26",
          "tipoDistribucion": "estandar",
          "porcentajes": {
            "emisionB": 60,
            "emision0": 30,
            "restante": 10
          },
          "intervaloCert": 15,
          "diasRevision": 5,
          "fechaFinProyecto": "2026-12-31",
          "hitos": [
            {
              "id": "id_v97hfz6le9vv",
              "nombre": "Emisión B",
              "porcentaje": 60,
              "reglaFecha": "emision_b",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_z4ike6n9e9vv",
              "nombre": "Emisión 0",
              "porcentaje": 30,
              "reglaFecha": "emision_0",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_kxdf2q6pe9vv",
              "nombre": "Restante Final",
              "porcentaje": 10,
              "reglaFecha": "cierre",
              "diasAdicionales": 0,
              "certificados": []
            }
          ],
          "incluirCurva": true,
          "esCHO": false,
          "ordenCompra": "4501465872",
          "observaciones": "",
          "id": "id_ht0lgy9se9vv"
        },
        {
          "empresaId": "emp_taging",
          "codigo": "B2.0003.05",
          "descripcion": "Memoria de Cálculo Estructura  Cabina y fundaciones",
          "categoria": "Ingenieria",
          "valorTotal": 4320,
          "fechaBase": "2026-11-04",
          "tipoDistribucion": "estandar",
          "porcentajes": {
            "emisionB": 60,
            "emision0": 30,
            "restante": 10
          },
          "intervaloCert": 15,
          "diasRevision": 5,
          "fechaFinProyecto": "2026-12-31",
          "hitos": [
            {
              "id": "id_nx06kyiwe9vv",
              "nombre": "Emisión B",
              "porcentaje": 60,
              "reglaFecha": "emision_b",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_t0a4o5c4e9vv",
              "nombre": "Emisión 0",
              "porcentaje": 30,
              "reglaFecha": "emision_0",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_8qmvypvce9vv",
              "nombre": "Restante Final",
              "porcentaje": 10,
              "reglaFecha": "cierre",
              "diasAdicionales": 0,
              "certificados": []
            }
          ],
          "incluirCurva": true,
          "esCHO": false,
          "ordenCompra": "4501465872",
          "observaciones": "",
          "id": "id_czxpz1q2e9vv"
        },
        {
          "empresaId": "emp_taging",
          "codigo": "B2.0003.06",
          "descripcion": "Planos Encofrado y Armaduras Fundaciones Cabina",
          "categoria": "Ingenieria",
          "valorTotal": 4320,
          "fechaBase": "2026-11-04",
          "tipoDistribucion": "estandar",
          "porcentajes": {
            "emisionB": 60,
            "emision0": 30,
            "restante": 10
          },
          "intervaloCert": 15,
          "diasRevision": 5,
          "fechaFinProyecto": "2026-12-31",
          "hitos": [
            {
              "id": "id_volibuzqe9vv",
              "nombre": "Emisión B",
              "porcentaje": 60,
              "reglaFecha": "emision_b",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_dszgwse9e9vv",
              "nombre": "Emisión 0",
              "porcentaje": 30,
              "reglaFecha": "emision_0",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_u6lmsdkie9vv",
              "nombre": "Restante Final",
              "porcentaje": 10,
              "reglaFecha": "cierre",
              "diasAdicionales": 0,
              "certificados": []
            }
          ],
          "incluirCurva": true,
          "esCHO": false,
          "ordenCompra": "4501465872",
          "observaciones": "",
          "id": "id_7rif7emye9vv"
        },
        {
          "empresaId": "emp_taging",
          "codigo": "B2.0003.02",
          "descripcion": "Memoria de Cálculo Fundaciones Equipos y soportes",
          "categoria": "Ingenieria",
          "valorTotal": 4320,
          "fechaBase": "2026-11-06",
          "tipoDistribucion": "estandar",
          "porcentajes": {
            "emisionB": 60,
            "emision0": 30,
            "restante": 10
          },
          "intervaloCert": 15,
          "diasRevision": 5,
          "fechaFinProyecto": "2026-12-31",
          "hitos": [
            {
              "id": "id_igxcbxzee9vv",
              "nombre": "Emisión B",
              "porcentaje": 60,
              "reglaFecha": "emision_b",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_4bzo6bjje9vv",
              "nombre": "Emisión 0",
              "porcentaje": 30,
              "reglaFecha": "emision_0",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_fm0d1itee9vv",
              "nombre": "Restante Final",
              "porcentaje": 10,
              "reglaFecha": "cierre",
              "diasAdicionales": 0,
              "certificados": []
            }
          ],
          "incluirCurva": true,
          "esCHO": false,
          "ordenCompra": "4501465872",
          "observaciones": "",
          "id": "id_lzf9zst7e9vv"
        },
        {
          "empresaId": "emp_taging",
          "codigo": "B2.0003.04",
          "descripcion": "Planos Encofrado y Armaduras Fundaciones",
          "categoria": "Ingenieria",
          "valorTotal": 3780,
          "fechaBase": "2026-11-06",
          "tipoDistribucion": "estandar",
          "porcentajes": {
            "emisionB": 60,
            "emision0": 30,
            "restante": 10
          },
          "intervaloCert": 15,
          "diasRevision": 5,
          "fechaFinProyecto": "2026-12-31",
          "hitos": [
            {
              "id": "id_90uavikce9vv",
              "nombre": "Emisión B",
              "porcentaje": 60,
              "reglaFecha": "emision_b",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_el0e3yg4e9vv",
              "nombre": "Emisión 0",
              "porcentaje": 30,
              "reglaFecha": "emision_0",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_v3uspja4e9vv",
              "nombre": "Restante Final",
              "porcentaje": 10,
              "reglaFecha": "cierre",
              "diasAdicionales": 0,
              "certificados": []
            }
          ],
          "incluirCurva": true,
          "esCHO": false,
          "ordenCompra": "4501465872",
          "observaciones": "",
          "id": "id_rn5dml1xe9vv"
        },
        {
          "empresaId": "emp_taging",
          "codigo": "B2.0003.07",
          "descripcion": "Cómputo Métrico Obra civil",
          "categoria": "Ingenieria",
          "valorTotal": 2160,
          "fechaBase": "2026-11-20",
          "tipoDistribucion": "estandar",
          "porcentajes": {
            "emisionB": 60,
            "emision0": 30,
            "restante": 10
          },
          "intervaloCert": 15,
          "diasRevision": 5,
          "fechaFinProyecto": "2026-12-31",
          "hitos": [
            {
              "id": "id_ux1fdlpre9vv",
              "nombre": "Emisión B",
              "porcentaje": 60,
              "reglaFecha": "emision_b",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_w91kyruqe9vv",
              "nombre": "Emisión 0",
              "porcentaje": 30,
              "reglaFecha": "emision_0",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_z6sfkf8te9vv",
              "nombre": "Restante Final",
              "porcentaje": 10,
              "reglaFecha": "cierre",
              "diasAdicionales": 0,
              "certificados": []
            }
          ],
          "incluirCurva": true,
          "esCHO": false,
          "ordenCompra": "4501465872",
          "observaciones": "",
          "id": "id_0k21f3eie9vv"
        },
        {
          "empresaId": "emp_taging",
          "codigo": "B2.0004.01",
          "descripcion": "Informe integrador  Ingeniería de Detalle",
          "categoria": "Ingenieria",
          "valorTotal": 2160,
          "fechaBase": "2026-11-25",
          "tipoDistribucion": "estandar",
          "porcentajes": {
            "emisionB": 60,
            "emision0": 30,
            "restante": 10
          },
          "intervaloCert": 15,
          "diasRevision": 5,
          "fechaFinProyecto": "2026-12-31",
          "hitos": [
            {
              "id": "id_qu14pmdte9vv",
              "nombre": "Emisión B",
              "porcentaje": 60,
              "reglaFecha": "emision_b",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_8n1fgqjve9vv",
              "nombre": "Emisión 0",
              "porcentaje": 30,
              "reglaFecha": "emision_0",
              "diasAdicionales": 0,
              "certificados": []
            },
            {
              "id": "id_td5icfu8e9vv",
              "nombre": "Restante Final",
              "porcentaje": 10,
              "reglaFecha": "cierre",
              "diasAdicionales": 0,
              "certificados": []
            }
          ],
          "incluirCurva": true,
          "esCHO": false,
          "ordenCompra": "4501465872",
          "observaciones": "",
          "id": "id_wk1mqt1ve9vv"
        },
        {
          "empresaId": "emp_taging",
          "codigo": "B3.0001.01",
          "descripcion": "CHO Inclusión Diseño de Cabina N°4",
          "categoria": "Ingenieria",
          "valorTotal": 8310,
          "fechaBase": "2026-08-28",
          "tipoDistribucion": "pago_unico",
          "porcentajes": {
            "emisionB": 60,
            "emision0": 30,
            "restante": 10
          },
          "intervaloCert": 15,
          "diasRevision": 5,
          "fechaFinProyecto": "2026-12-31",
          "hitos": [
            {
              "id": "id_jo0f58gmjg8b",
              "nombre": "Pago único",
              "porcentaje": 100,
              "reglaFecha": "pago_unico",
              "diasAdicionales": 0,
              "certificados": [
                {
                  "id": "id_aj1shyws30y0",
                  "grupo": "id_84bd5gb430y0",
                  "nombre": "Certificado 5",
                  "numero": "5",
                  "ordenCompra": "",
                  "fechaPresentacion": "2026-09-02",
                  "fechaAprobacion": "2026-09-02",
                  "fechaCobro": "2026-09-02",
                  "importe": 9749.818181818182,
                  "tipo": "normal",
                  "estado": "Cobrado",
                  "observaciones": ""
                }
              ]
            }
          ],
          "incluirCurva": true,
          "esCHO": true,
          "ordenCompra": "4501553040",
          "observaciones": "",
          "id": "id_fleoibrue9vv"
        },
        {
          "empresaId": "emp_taging",
          "codigo": "B6.0001.01",
          "descripcion": "CHO ",
          "categoria": "Ingeniería ",
          "valorTotal": 14580,
          "fechaBase": "2026-08-28",
          "tipoDistribucion": "pago_unico",
          "porcentajes": {
            "emisionB": 60,
            "emision0": 30,
            "restante": 10
          },
          "intervaloCert": 15,
          "diasRevision": 5,
          "fechaFinProyecto": "2026-12-31",
          "hitos": [
            {
              "id": "id_k66k28mvpk7d",
              "nombre": "Pago único",
              "porcentaje": 100,
              "reglaFecha": "pago_unico",
              "diasAdicionales": 0,
              "certificados": [
                {
                  "id": "id_5eclvq7v1i34",
                  "grupo": "id_ih9xap0w1i34",
                  "nombre": "Certificado 4",
                  "numero": "4",
                  "ordenCompra": "",
                  "fechaPresentacion": "2026-08-07",
                  "fechaAprobacion": "2026-08-07",
                  "fechaCobro": "2026-08-07",
                  "importe": 16019.818181818182,
                  "tipo": "normal",
                  "estado": "Cobrado",
                  "observaciones": ""
                }
              ]
            }
          ],
          "incluirCurva": true,
          "esCHO": false,
          "ordenCompra": "4501553040",
          "observaciones": "",
          "id": "id_s6evi35mqe2h"
        }
      ],
      "fechasCorte": {
        "emp_taging": [
          "2026-06-08",
          "2026-06-18",
          "2026-07-01",
          "2026-07-05",
          "2026-07-25",
          "2026-08-05",
          "2026-08-13",
          "2026-08-28",
          "2026-09-16",
          "2026-09-27",
          "2026-10-12",
          "2026-10-27",
          "2026-11-11",
          "2026-11-26",
          "2026-12-15",
          "2026-12-31",
          "2027-01-01",
          "2027-06-01"
        ]
      },
      "gastosDivididos": {
        "emp_taging": [
          0
        ]
      },
      "config": {
        "tolerancia": 2
      },
      "gastosActividad": {
        "emp_taging": [
          {
            "id": "g_n9qiz3j",
            "nombre": "Gastos generales",
            "monto": 47514,
            "modo": "igual",
            "pesos": {
              "id_0ib9v41d7vyb": 1,
              "id_dnz4k6hee9vv": 1,
              "id_z5gdrko7e9vv": 1,
              "id_gtpug03oe9vv": 1,
              "id_u7fchfsye9vv": 1,
              "id_pezlp04ne9vv": 1,
              "id_fgouprife9vv": 1,
              "id_zin9szyue9vv": 1,
              "id_styxj7xge9vv": 1,
              "id_jrvv0y65e9vv": 1,
              "id_zntj0zli4dy3": 1,
              "id_e68fo9i4e9vv": 1,
              "id_v5ntmbz6e9vv": 1,
              "id_pzcddqv3e9vv": 1,
              "id_2mu8zcibe9vv": 1,
              "id_z8w3xozke9vv": 1,
              "id_4a2yfl8ge9vv": 1,
              "id_5kty3n2qe9vv": 1,
              "id_htfuwbz6e9vv": 1,
              "id_n580sjxte9vv": 1,
              "id_kfqqwb09e9vv": 1,
              "id_dhh2gwmwe9vv": 1,
              "id_cnq7wg5de9vv": 1,
              "id_xr85lfm7e9vv": 1,
              "id_1oslozj1e9vv": 1,
              "id_sdfbshune9vv": 1,
              "id_mhf0plmpe9vv": 1,
              "id_p8ah7fqpe9vv": 1,
              "id_w24paxdue9vv": 1,
              "id_2a8nl1qwe9vv": 1,
              "id_a7uuy0ace9vv": 1,
              "id_d08prizqe9vv": 1,
              "id_p8rjzazje9vv": 1,
              "id_4ffv1dcne9vv": 1,
              "id_lxwer58fe9vv": 1,
              "id_u90xx5pge9vv": 1,
              "id_8oir7xrfe9vv": 1,
              "id_l3ord1r8e9vv": 1,
              "id_x8dzzsqee9vv": 1,
              "id_gfr6h5wve9vv": 1,
              "id_jeqz3fa3e9vv": 1,
              "id_libtbfhxe9vv": 1,
              "id_hw4bxsdce9vv": 1,
              "id_knvqqat7e9vv": 1,
              "id_v67pzu6ye9vv": 1,
              "id_wc1on2jke9vv": 1,
              "id_5hqbfncpe9vv": 1,
              "id_p7juh9w7e9vv": 1,
              "id_aygli2k9e9vv": 1,
              "id_1pjqctnze9vv": 1,
              "id_psqixvike9vv": 1,
              "id_6r6g7wtoe9vv": 1,
              "id_kk5m7qjje9vv": 1,
              "id_fr5d0u5ke9vv": 1,
              "id_yr3exqyle9vv": 1,
              "id_jzz4ghzie9vv": 1,
              "id_vq5po9bhe9vv": 1,
              "id_a2qlqrqre9vv": 1,
              "id_5k5l3asse9vv": 1,
              "id_e9xqog76e9vv": 1,
              "id_f6e0yyz7e9vv": 1,
              "id_7uexzcdue9vv": 1,
              "id_6ofwz20se9vv": 1,
              "id_zet7gwy5e9vv": 1,
              "id_3yfxuty7e9vv": 1,
              "id_08tfh404e9vv": 1,
              "id_t8om17ude9vv": 1,
              "id_rp0nr8p6e9vv": 1,
              "id_v97hfz6le9vv": 1,
              "id_z4ike6n9e9vv": 1,
              "id_kxdf2q6pe9vv": 1,
              "id_nx06kyiwe9vv": 1,
              "id_t0a4o5c4e9vv": 1,
              "id_8qmvypvce9vv": 1,
              "id_volibuzqe9vv": 1,
              "id_dszgwse9e9vv": 1,
              "id_u6lmsdkie9vv": 1,
              "id_igxcbxzee9vv": 1,
              "id_4bzo6bjje9vv": 1,
              "id_fm0d1itee9vv": 1,
              "id_90uavikce9vv": 1,
              "id_el0e3yg4e9vv": 1,
              "id_v3uspja4e9vv": 1,
              "id_ux1fdlpre9vv": 1,
              "id_w91kyruqe9vv": 1,
              "id_z6sfkf8te9vv": 1,
              "id_qu14pmdte9vv": 1,
              "id_8n1fgqjve9vv": 1,
              "id_td5icfu8e9vv": 1,
              "id_jo0f58gmjg8b": 1,
              "id_k66k28mvpk7d": 1
            }
          }
        ]
      }
    },
    {
      "id": "id_37fprw710484",
      "nombre": "Veladero",
      "empresas": [
        {
          "id": "emp_74e5id5",
          "nombre": "Taging",
          "color": "blue"
        }
      ],
      "entregables": [],
      "fechasCorte": {
        "emp_74e5id5": []
      },
      "gastosDivididos": {
        "emp_74e5id5": []
      },
      "config": {
        "tolerancia": 2
      }
    }
  ],
  "proyectoActual": "proj_4ky860",
  "tema": "empresa"
};
