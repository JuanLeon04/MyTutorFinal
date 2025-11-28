package uis.mytutor.servicio.interfaz;

public interface IAuthServicio {

    // iniciar sesión
    String login(String nombreUsuario, String password);

    // registrarse
}
