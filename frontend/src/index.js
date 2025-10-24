import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import GuardRoute from './components/guardRoute';
import { AuthContextProvider } from './context/auth';
import { ThemeContextProvider } from './context/theme';
import { GlobalsContextProvider } from './context/globals';
import { LoadingModalContextProvider } from './components/modal/loading';
import { AlertModalContextProvider } from './components/modal/alert';
import { SnackbarProvider } from 'notistack';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import DashboardProductividad from './pages/dashboard-productividad';
import QrFirmaPublic from './pages/qr-firma';
import Tgd from './pages/tgd';

import ConsultoriosExternos from './pages/consultorios-externos';
import EditarConsultorioExterno from './pages/consultorios-externos/editar';
import AprobarRechazarConsultorioExterno from './pages/consultorios-externos/aprobarRechazar';

import ProMatInfantil from './pages/pro-mat-infantil';
import EditarProMatInfantil from './pages/pro-mat-infantil/editar';
import AprobarRechazarProMatInfantil from './pages/pro-mat-infantil/aprobarRechazar';

import CoordinacionArquitectura from './pages/coordinacion-arquitectura';

import CoordinacionRrhh from './pages/coordinacion-rrhh';

import CoordinacionRecupero from './pages/coordinacion-recupero';

import ProduccionMensual from './pages/produccion-mensual';
import EditarProduccionMensual from './pages/produccion-mensual/editar';
import AprobarRechazarProduccionMensual from './pages/produccion-mensual/aprobarRechazar';

import Obstetricia from './pages/obstetricia';
import EditarObstetricia from './pages/obstetricia/editar';
import AprobarRechazarObstetricia from './pages/obstetricia/aprobarRechazar';

import RecibidoDerivado from './pages/recibido-derivado';
import EditarRecibidoDerivado from './pages/recibido-derivado/editar';
import AprobarRechazarRecibidoDerivado from './pages/recibido-derivado/aprobarRechazar';

import Hospitalizacion from './pages/hospitalizacion';
import EditarHospitalizacion from './pages/hospitalizacion/editar';
import AprobarRechazarHospitalizacion from './pages/hospitalizacion/aprobarRechazar';
import VerHospitalizacion from './pages/hospitalizacion/ver';
import CodificarHospitalizacion from './pages/hospitalizacion/codificar';
import AprobarRechazarCodificacionHospitalizacion from './pages/hospitalizacion/aprobarRechazarCodificacion';

import TrabSocial from './pages/trabajo-social';
import EditarTrabSocial from './pages/trabajo-social/editar';
import AprobarRechazarTrabSocial from './pages/trabajo-social/aprobarRechazar';

import Enfermeria from './pages/enfermeria';
import EditarEnfermeria from './pages/enfermeria/editar';
import AprobarRechazarEnfermeria from './pages/enfermeria/aprobarRechazar';
import VerEnermeria from './pages/enfermeria/ver';

import RecursosSalud from './pages/recursos-salud';
import EditarRecursosSalud from './pages/recursos-salud/editar';
import AprobarRechazarRecursosSalud from './pages/recursos-salud/aprobarRechazar';

import Dengue from './pages/dengue';
import EditarDengue from './pages/dengue/editar';
import AprobarRechazarDengue from './pages/dengue/aprobarRechazar';

import Establecimiento from './pages/establecimiento';
import EditarEstablecimiento from './pages/establecimiento/editar';

import Usuario from './pages/usuario';
import EditarUsuario from './pages/usuario/editar';

import ReporteFaltantes from './pages/reporte/faltantes';
import ReporteActAgentesSanitarios from './pages/reporte/act-agentes-sanitarios';
import ReporteConsultorioExterno from './pages/reporte/consultorio-externo';
import ReporteObstetricia from './pages/reporte/obstetricia';
import ReporteProduccionMensual from './pages/reporte/produccion-mensual';
import ReporteProMatInfantil from './pages/reporte/pro-mat-infantil';
import ReporteRecibidoDerivado from './pages/reporte/recibido-derivado';
import ReporteRecursosSalud from './pages/reporte/recursos-salud';
import ReporteTrabajoSocial from './pages/reporte/trabajo-social';
import ReporteEstablecimientos from './pages/reporte/establecimientos';

import 'typeface-roboto';

const root = (
    <HashRouter basename={""}>
        <AuthContextProvider>
            <GlobalsContextProvider>
                <ThemeContextProvider>
                    <SnackbarProvider
                        maxSnack={3}
                        anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
                        autoHideDuration={6000}
                    >
                        <LoadingModalContextProvider>
                            <AlertModalContextProvider>
                                <Routes>
                                    <Route path="/qr-firma/:qr" element={
                                        <GuardRoute type="global" path="/qr-firma/:qr" component={<QrFirmaPublic />} />
                                    } />

                                    <Route path="/tgd/:version/:code" element={
                                        <GuardRoute type="global" path="/tgd/:version/:code" component={<Tgd />} />
                                    } />

                                    <Route path="/login" element={
                                        <GuardRoute type="public" path="/login" component={<Login />} />
                                    } />
                                    <Route path="/login/:token/:window" element={
                                        <GuardRoute type="public" path="/login/:token/:window" component={<Login />} />
                                    } />

                                    <Route path="/dashboard" element={
                                        <GuardRoute type="private" path="/dashboard" component={<Dashboard />} />
                                    } />
                                    <Route path="/dashboard-productividad" element={
                                        <GuardRoute type="private" path="/dashboard" component={<DashboardProductividad />} />
                                    } />



                                    <Route path="/tablero/coordinacion/arquitectura-hospitalaria" element={
                                        <GuardRoute type="private" path="/tablero/coordinacion/arquitectura-hospitalaria" component={<CoordinacionArquitectura />} />
                                    } />

                                    <Route path="/tablero/coordinacion/rrhh" element={
                                        <GuardRoute type="private" path="/tablero/coordinacion/rrhh" component={<CoordinacionRrhh />} />
                                    } />
                                    <Route path="/tablero/coordinacion/recupero-gastos" element={
                                        <GuardRoute type="private" path="/tablero/coordinacion/recupero-gastos" component={<CoordinacionRecupero />} />
                                    } />




                                    <Route path="/consultorios-externos/aprobar-rechazar" element={
                                        <GuardRoute type="private" path="/consultorios-externos/aprobar-rechazar" component={<AprobarRechazarConsultorioExterno />} />
                                    } />
                                    <Route path="/consultorios-externos/nuevo" element={
                                        <GuardRoute type="private" path="/consultorios-externos/nuevo" component={<EditarConsultorioExterno />} />
                                    } />
                                    <Route path="/consultorios-externos/corregir" element={
                                        <GuardRoute type="private" path="/consultorios-externos/corregir" component={<EditarConsultorioExterno />} />
                                    } />
                                    <Route path="/consultorios-externos/editar" element={
                                        <GuardRoute type="private" path="/consultorios-externos/editar" component={<EditarConsultorioExterno />} />
                                    } />
                                    <Route path="/consultorios-externos" element={
                                        <GuardRoute type="private" path="/consultorios-externos" component={<ConsultoriosExternos />} />
                                    } />

                                    <Route path="/pro-mat-infantil/aprobar-rechazar" element={
                                        <GuardRoute type="private" path="/pro-mat-infantil/aprobar-rechazar" component={<AprobarRechazarProMatInfantil />} />
                                    } />
                                    <Route path="/pro-mat-infantil/nuevo" element={
                                        <GuardRoute type="private" path="/pro-mat-infantil/nuevo" component={<EditarProMatInfantil />} />
                                    } />
                                    <Route path="/pro-mat-infantil/corregir" element={
                                        <GuardRoute type="private" path="/pro-mat-infantil/corregir" component={<EditarProMatInfantil />} />
                                    } />
                                    <Route path="/pro-mat-infantil/editar" element={
                                        <GuardRoute type="private" path="/pro-mat-infantil/editar" component={<EditarProMatInfantil />} />
                                    } />
                                    <Route path="/pro-mat-infantil" element={
                                        <GuardRoute type="private" path="/pro-mat-infantil" component={<ProMatInfantil />} />
                                    } />

                                    <Route path="/produccion-mensual/aprobar-rechazar" element={
                                        <GuardRoute type="private" path="/produccion-mensual/aprobar-rechazar" component={<AprobarRechazarProduccionMensual />} />
                                    } />
                                    <Route path="/produccion-mensual/nuevo" element={
                                        <GuardRoute type="private" path="/produccion-mensual/nuevo" component={<EditarProduccionMensual />} />
                                    } />
                                    <Route path="/produccion-mensual/corregir" element={
                                        <GuardRoute type="private" path="/produccion-mensual/corregir" component={<EditarProduccionMensual />} />
                                    } />
                                    <Route path="/produccion-mensual/editar" element={
                                        <GuardRoute type="private" path="/produccion-mensual/editar" component={<EditarProduccionMensual />} />
                                    } />
                                    <Route path="/produccion-mensual" element={
                                        <GuardRoute type="private" path="/produccion-mensual" component={<ProduccionMensual />} />
                                    } />

                                    <Route path="/obstetricia/aprobar-rechazar" element={
                                        <GuardRoute type="private" path="/obstetricia/aprobar-rechazar" component={<AprobarRechazarObstetricia />} />
                                    } />
                                    <Route path="/obstetricia/nuevo" element={
                                        <GuardRoute type="private" path="/obstetricia/nuevo" component={<EditarObstetricia />} />
                                    } />
                                    <Route path="/obstetricia/corregir" element={
                                        <GuardRoute type="private" path="/obstetricia/corregir" component={<EditarObstetricia />} />
                                    } />
                                    <Route path="/obstetricia/editar" element={
                                        <GuardRoute type="private" path="/obstetricia/editar" component={<EditarObstetricia />} />
                                    } />
                                    <Route path="/obstetricia" element={
                                        <GuardRoute type="private" path="/obstetricia" component={<Obstetricia />} />
                                    } />

                                    <Route path="/recibido-derivado/aprobar-rechazar" element={
                                        <GuardRoute type="private" path="/recibido-derivado/aprobar-rechazar" component={<AprobarRechazarRecibidoDerivado />} />
                                    } />
                                    <Route path="/recibido-derivado/nuevo" element={
                                        <GuardRoute type="private" path="/recibido-derivado/nuevo" component={<EditarRecibidoDerivado />} />
                                    } />
                                    <Route path="/recibido-derivado/corregir" element={
                                        <GuardRoute type="private" path="/recibido-derivado/corregir" component={<EditarRecibidoDerivado />} />
                                    } />
                                    <Route path="/recibido-derivado/editar" element={
                                        <GuardRoute type="private" path="/recibido-derivado/editar" component={<EditarRecibidoDerivado />} />
                                    } />
                                    <Route path="/recibido-derivado" element={
                                        <GuardRoute type="private" path="/recibido-derivado" component={<RecibidoDerivado />} />
                                    } />


                                    <Route path="/hospitalizacion/aprobar-rechazar-codificacion" element={
                                        <GuardRoute type="private" path="/hospitalizacion/aprobar-rechazar-codificacion" component={<AprobarRechazarCodificacionHospitalizacion />} />
                                    } />
                                    <Route path="/hospitalizacion/codificar" element={
                                        <GuardRoute type="private" path="/hospitalizacion/codificar" component={<CodificarHospitalizacion />} />
                                    } />
                                    <Route path="/hospitalizacion/ver" element={
                                        <GuardRoute type="private" path="/hospitalizacion/ver" component={<VerHospitalizacion />} />
                                    } />
                                    <Route path="/hospitalizacion/aprobar-rechazar" element={
                                        <GuardRoute type="private" path="/hospitalizacion/aprobar-rechazar" component={<AprobarRechazarHospitalizacion />} />
                                    } />
                                    <Route path="/hospitalizacion/nuevo" element={
                                        <GuardRoute type="private" path="/hospitalizacion/nuevo" component={<EditarHospitalizacion />} />
                                    } />
                                    <Route path="/hospitalizacion/corregir" element={
                                        <GuardRoute type="private" path="/hospitalizacion/corregir" component={<EditarHospitalizacion />} />
                                    } />
                                    <Route path="/hospitalizacion/editar" element={
                                        <GuardRoute type="private" path="/hospitalizacion/editar" component={<EditarHospitalizacion />} />
                                    } />
                                    <Route path="/hospitalizacion" element={
                                        <GuardRoute type="private" path="/hospitalizacion" component={<Hospitalizacion />} />
                                    } />

                                    <Route path="/trabajo-social/aprobar-rechazar" element={
                                        <GuardRoute type="private" path="/trabajo-social/aprobar-rechazar" component={<AprobarRechazarTrabSocial />} />
                                    } />
                                    <Route path="/trabajo-social/nuevo" element={
                                        <GuardRoute type="private" path="/trabajo-social/nuevo" component={<EditarTrabSocial />} />
                                    } />
                                    <Route path="/trabajo-social/corregir" element={
                                        <GuardRoute type="private" path="/trabajo-social/corregir" component={<EditarTrabSocial />} />
                                    } />
                                    <Route path="/trabajo-social/editar" element={
                                        <GuardRoute type="private" path="/trabajo-social/editar" component={<EditarTrabSocial />} />
                                    } />
                                    <Route path="/trabajo-social" element={
                                        <GuardRoute type="private" path="/trabajo-social" component={<TrabSocial />} />
                                    } />

                                    <Route path="/enfermeria/ver" element={
                                        <GuardRoute type="private" path="/enfermeria/ver" component={<VerEnermeria />} />
                                    } />
                                    <Route path="/enfermeria/aprobar-rechazar" element={
                                        <GuardRoute type="private" path="/enfermeria/aprobar-rechazar" component={<AprobarRechazarEnfermeria />} />
                                    } />
                                    <Route path="/enfermeria/nuevo" element={
                                        <GuardRoute type="private" path="/enfermeria/nuevo" component={<EditarEnfermeria />} />
                                    } />
                                    <Route path="/enfermeria/corregir" element={
                                        <GuardRoute type="private" path="/enfermeria/corregir" component={<EditarEnfermeria />} />
                                    } />
                                    <Route path="/enfermeria/editar" element={
                                        <GuardRoute type="private" path="/enfermeria/editar" component={<EditarEnfermeria />} />
                                    } />
                                    <Route path="/enfermeria" element={
                                        <GuardRoute type="private" path="/enfermeria" component={<Enfermeria />} />
                                    } />

                                    <Route path="/recursos-salud/aprobar-rechazar" element={
                                        <GuardRoute type="private" path="/recursos-salud/aprobar-rechazar" component={<AprobarRechazarRecursosSalud />} />
                                    } />
                                    <Route path="/recursos-salud/nuevo" element={
                                        <GuardRoute type="private" path="/recursos-salud/nuevo" component={<EditarRecursosSalud />} />
                                    } />
                                    <Route path="/recursos-salud/corregir" element={
                                        <GuardRoute type="private" path="/recursos-salud/corregir" component={<EditarRecursosSalud />} />
                                    } />
                                    <Route path="/recursos-salud/editar" element={
                                        <GuardRoute type="private" path="/recursos-salud/editar" component={<EditarRecursosSalud />} />
                                    } />
                                    <Route path="/recursos-salud" element={
                                        <GuardRoute type="private" path="/recursos-salud" component={<RecursosSalud />} />
                                    } />


                                    <Route path="/establecimiento/nuevo" element={
                                        <GuardRoute type="private" path="/establecimiento/nuevo" component={<EditarEstablecimiento />} />
                                    } />
                                    <Route path="/establecimiento/editar" element={
                                        <GuardRoute type="private" path="/establecimiento/editar" component={<EditarEstablecimiento />} />
                                    } />
                                    <Route path="/establecimiento" element={
                                        <GuardRoute type="private" path="/establecimiento" component={<Establecimiento />} />
                                    } />


                                    <Route path="/usuario/nuevo" element={
                                        <GuardRoute type="private" path="/usuario/nuevo" component={<EditarUsuario />} />
                                    } />
                                    <Route path="/usuario/editar" element={
                                        <GuardRoute type="private" path="/usuario/editar" component={<EditarUsuario />} />
                                    } />
                                    <Route path="/usuario" element={
                                        <GuardRoute type="private" path="/usuario" component={<Usuario />} />
                                    } />

                                    <Route path="/dengue/aprobar-rechazar" element={
                                        <GuardRoute type="private" path="/dengue/aprobar-rechazar" component={<AprobarRechazarDengue />} />
                                    } />
                                    <Route path="/dengue/nuevo" element={
                                        <GuardRoute type="private" path="/dengue/nuevo" component={<EditarDengue />} />
                                    } />
                                    <Route path="/dengue/corregir" element={
                                        <GuardRoute type="private" path="/dengue/corregir" component={<EditarDengue />} />
                                    } />
                                    <Route path="/dengue/editar" element={
                                        <GuardRoute type="private" path="/dengue/editar" component={<EditarDengue />} />
                                    } />
                                    <Route path="/dengue" element={
                                        <GuardRoute type="private" path="/dengue" component={<Dengue />} />
                                    } />


                                    <Route path="/reporte/faltantes" element={
                                        <GuardRoute type="private" path="/reporte/faltantes" component={<ReporteFaltantes />} />
                                    } />
                                    <Route path="/reporte/actAgentesSanitarios" element={
                                        <GuardRoute type="private" path="/reporte/actAgentesSanitarios" component={<ReporteActAgentesSanitarios />} />
                                    } />
                                    <Route path="/reporte/consultorioExterno" element={
                                        <GuardRoute type="private" path="/reporte/consultorioExterno" component={<ReporteConsultorioExterno />} />
                                    } />
                                    <Route path="/reporte/rep_obstetricia" element={
                                        <GuardRoute type="private" path="/reporte/rep_obstetricia" component={<ReporteObstetricia />} />
                                    } />
                                    <Route path="/reporte/produccionMensual" element={
                                        <GuardRoute type="private" path="/reporte/produccionMensual" component={<ReporteProduccionMensual />} />
                                    } />
                                    <Route path="/reporte/proMatInfantil" element={
                                        <GuardRoute type="private" path="/reporte/proMatInfantil" component={<ReporteProMatInfantil />} />
                                    } />
                                    <Route path="/reporte/recibidoDerivado" element={
                                        <GuardRoute type="private" path="/reporte/recibidoDerivado" component={<ReporteRecibidoDerivado />} />
                                    } />
                                    <Route path="/reporte/recursosSalud" element={
                                        <GuardRoute type="private" path="/reporte/recursosSalud" component={<ReporteRecursosSalud />} />
                                    } />
                                    <Route path="/reporte/trabajoSocial" element={
                                        <GuardRoute type="private" path="/reporte/trabajoSocial" component={<ReporteTrabajoSocial />} />
                                    } />
                                    <Route path="/reporte/establecimient" element={
                                        <GuardRoute type="private" path="/reporte/establecimient" component={<ReporteEstablecimientos />} />
                                    } />

                                    <Route path="/" element={<Navigate to="/login" replace />} />
                                </Routes>
                            </AlertModalContextProvider>
                        </LoadingModalContextProvider>
                    </SnackbarProvider>
                </ThemeContextProvider>
            </GlobalsContextProvider>
        </AuthContextProvider>
    </HashRouter>
);

const container = document.getElementById('root');
const appRender = ReactDOMClient.createRoot(container);
appRender.render(root);