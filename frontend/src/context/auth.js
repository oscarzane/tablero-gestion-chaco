import React from 'react';

const constantes = {
    timeout: (2*60*60*1000),
    usuario: "ch-siesp-usuario"
}

export const AuthContext = React.createContext({});

export const AuthContextConsumer = AuthContext.Consumer;

export class AuthContextProvider extends React.Component {
    updateUsuario = (usuario) => {
        if(usuario){
            usuario.date = new Date().toString();
            window.localStorage.setItem(constantes.usuario, JSON.stringify(usuario));
        }
        else
            window.localStorage.removeItem(constantes.usuario);
            
        this.setState({ usuario });
    }

    state = {
        usuario: JSON.parse(window.localStorage.getItem(constantes.usuario)),
        updateUsuario: this.updateUsuario
    }

    checkLoginTimeout(){
        const usuarioLS = JSON.parse(window.localStorage.getItem(constantes.usuario));
        const timeout = constantes.timeout;
        const tiempoTranscurrido = usuarioLS ? new Date() - new Date(usuarioLS.date) : Number.MAX_SAFE_INTEGER;

        if(tiempoTranscurrido > timeout){
            this.updateUsuario(null);
        }
        else{
            this.updateUsuario(usuarioLS);
        }

    }

    componentDidMount() {
        this.checkLoginTimeout();
        
        window.onclick = () =>{
            this.checkLoginTimeout();
        }
    }

    render() {
        const { children } = this.props;

        return (
            <AuthContext.Provider
                value={{
                    ...this.state,
                }}
            >
                {children}
            </AuthContext.Provider>
        );
    }
}