package uis.mytutor.Excepciones;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

public class AuthExcepciones {

    @ResponseStatus(HttpStatus.NOT_FOUND)
    public static class UsuarioNoEncontradoException extends RuntimeException {
        public UsuarioNoEncontradoException(String mensaje) {
            super(mensaje);
        }
    }

    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public static class CredencialesInvalidasException extends RuntimeException {
        public CredencialesInvalidasException(String mensaje) {
            super(mensaje);
        }
    }
}
