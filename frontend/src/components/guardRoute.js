
import { useContext } from "react";
import { AuthContext } from "../context/auth";
import { Navigate, useParams } from "react-router-dom";

const GuardRoute = ({ type, path, component }) => {
    //usuario cuando es leido por api vale null o object, si aun no fue leido vale false
    const { usuario } = useContext(AuthContext);

    let { window } = useParams();//permite ir a una pantalla en especial tras un loguin por token

    const kickLogin = <Navigate to="/login" replace />;
    const kickDashboard = <Navigate to="/dashboard" replace />;

    if (type === 'global') { // las paginas global no requieren control de ruta
        //nada, no requiere control de ruta lo global
    }
    else if (type === 'public') {//pagina publica
        if (usuario !== false && usuario !== null) {//vale object, ir a dashboard o a pagina en especial
            switch (window) {//si tengo una pagina por parametro
                case "1": {
                    return <Navigate to="/dengue/nuevo" replace />;
                }
            }

            return kickDashboard;
        }
    }
    else if (type === 'private') {//si la pagina es privada
        if (usuario == null) {//fue leido y vale null, ir a login
            return kickLogin;
        }
        else if (usuario !== false) {//fue leido y vale object

            if (path.includes("/reporte") && (usuario.admin * 1 + usuario.solo_region * 1 + usuario.revisor * 1 + usuario.scarga * 1 + usuario.scodif * 1) < 1)
                return kickDashboard;

            if ((path.includes("/establecimiento") || path.includes("/usuario")) && usuario.admin * 1 === 0)
                return kickDashboard;

            /*if (path.includes("/recursos-salud") && usuario.admin * 1 !== 0 && usuario.solo_region * 1 !== 0 && usuario.revisor * 1 !== 1)
                return kickDashboard;*/

            //si no es un usuario especial
            if ((usuario.admin * 1 + usuario.solo_region * 1 + usuario.revisor * 1) < 1) {
                //verifico si su establecimiento tiene la planilla habilitada
                if ((path.includes("/act-agentes-sanitarios") && usuario.a_agensanit * 1 === 0) ||
                    (path.includes("/consultorios-externos") && usuario.a_consuextern * 1 === 0) ||
                    (path.includes("/obstetricia") && usuario.a_obstetricia * 1 === 0) ||
                    (path.includes("/produccion-mensual") && usuario.a_prodmensual * 1 === 0) ||
                    (path.includes("/pro-mat-infantil") && usuario.a_materinfan * 1 === 0) ||
                    (path.includes("/recibido-derivado") && usuario.a_recibyderiv * 1 === 0) ||
                    (path.includes("/laboratorio") && usuario.a_laboratorio * 1 === 0) ||
                    (path.includes("/hospitalizacion") && usuario.a_hospitalizacion * 1 === 0) ||
                    (path.includes("/trabajo-social") && usuario.a_trabajosocial * 1 === 0))
                    return kickDashboard;
            }
        }
    }

    return component;//component ? component : <Outlet />;
};

export default GuardRoute;