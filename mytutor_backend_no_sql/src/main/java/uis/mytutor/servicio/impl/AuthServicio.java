package uis.mytutor.servicio.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import uis.mytutor.Excepciones.AuthExcepciones;
import uis.mytutor.configuraciones.jwt.JwtUtil;
import uis.mytutor.dto.SolicitudRegistro;
import uis.mytutor.dto.UsuarioDTO;
import uis.mytutor.modelo.Usuario;
import uis.mytutor.repositorio.UsuarioRepositorio;
import uis.mytutor.servicio.interfaz.IAuthServicio;

@Service
public class AuthServicio implements IAuthServicio {

    @Autowired
    private UsuarioRepositorio usuarioRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Iniciar sesion
    @Override
    public String login(String nombreUsuario, String password) {
        var usuario = usuarioRepository.findByNombreUsuario(nombreUsuario)
                .orElseThrow(() -> new AuthExcepciones.CredencialesInvalidasException("Usuario o contraseña incorrectos"));

        if (!passwordEncoder.matches(password, usuario.getPassword())) {
            throw new AuthExcepciones.CredencialesInvalidasException("Usuario o contraseña incorrectos");
        } else if (!usuario.isActivo()) {
            throw new AuthExcepciones.CredencialesInvalidasException("Usuario inactivo");
        }

        // Obtener el rol del enum
        Usuario.Rol preRol = usuario.getRol();
        String rolFinal= "ESTUDIANTE";

        // ADMIN — validación estricta
        if (preRol == Usuario.Rol.ADMIN && nombreUsuario.equals("admin")) {
            rolFinal = "ADMIN";
        }
        // TUTOR — solo si está activo en datos de tutor
        else if (preRol == Usuario.Rol.TUTOR && usuario.getTutor() != null) {
            if (usuario.getTutor().isActivo()) {
                rolFinal = "TUTOR";
            }
        }

        // Si todo está bien → generar token
        return jwtUtil.generateToken(nombreUsuario, rolFinal);
    }

    // Registrar usuario en el servicio de usuario
}
