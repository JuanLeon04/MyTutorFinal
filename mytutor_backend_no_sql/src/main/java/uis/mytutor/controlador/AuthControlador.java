package uis.mytutor.controlador;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uis.mytutor.dto.SolicitudLogin;
import uis.mytutor.dto.SolicitudRegistro;
import uis.mytutor.dto.UsuarioDTO;
import uis.mytutor.servicio.impl.AuthServicio;
import uis.mytutor.servicio.impl.UsuarioServicio;

@RestController
@RequestMapping("/auth")
@CrossOrigin
@Tag(name = "auth", description = "Inicio de sesion y registro")
public class AuthControlador {

    @Autowired
    private AuthServicio authServicio;

    @Autowired
    private UsuarioServicio usuarioServicio;

    @Operation(summary = "Iniciar sesion y obtener token JWT Bearer")
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody SolicitudLogin solicitud) {
        return ResponseEntity.ok(authServicio.login(solicitud.getNombreUsuario(), solicitud.getPassword()));
    }

    @Operation(summary = "Registrarse como nuevo usuario")
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody SolicitudRegistro solicitud) {
        return ResponseEntity.ok(usuarioServicio.register(solicitud));
    }
}