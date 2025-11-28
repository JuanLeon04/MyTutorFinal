package uis.mytutor.controlador;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uis.mytutor.dto.UsuarioDTO;
import uis.mytutor.modelo.Usuario;
import uis.mytutor.servicio.impl.UsuarioServicio;

import java.util.List;

@RestController
@RequestMapping("/api/usuario")
@Tag(name = "Usuario", description = "EndPoints sobre el Usuario")
public class UsuarioControlador {

    @Autowired
    UsuarioServicio usuarioServicio;

    @Operation(summary = "Listar todos los usuarios (Solo rol ADMIN)")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/list")
    public List<UsuarioDTO> getUsuarios() {
        return usuarioServicio.getUsuarios();
    }

    @Operation(summary = "Obtener un usuario por ID (solo rol ADMIN)")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioDTO> obtenerUsuarioPorId(@PathVariable String id) {
        UsuarioDTO obj = usuarioServicio.getUsuarioById(id);
        return ResponseEntity.ok().body(obj);
    }

    @Operation(summary = "Que el usuario se obtenga a si mismo")
    @GetMapping()
    public ResponseEntity<Usuario> obtenerMyUsuario(Authentication authentication) {

        Usuario usuarioActual = (Usuario) authentication.getPrincipal(); // lo que pusiste en el filtro

        Usuario obj = usuarioServicio.getMyUsuario(usuarioActual);
        return ResponseEntity.ok().body(obj);
    }

    @Operation(summary = "Actualizar usuario")
    @PutMapping() //actualizar
    public ResponseEntity<UsuarioDTO> actualizarUsuario(@RequestBody Usuario usuario, Authentication authentication) {

        Usuario usuarioActual = (Usuario) authentication.getPrincipal(); // lo que pusiste en el filtro
        String rol = authentication.getAuthorities().iterator().next().getAuthority(); // ej. ROLE_TUTOR

        UsuarioDTO obj = usuarioServicio.updateUsuario(usuario, usuarioActual, rol);
        return ResponseEntity.ok().body(obj);
    }

    @Operation(summary = "Borrar usuario por ID (Solo rol ADMIN) SOFT DELETE")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarUsuarioPorId(@PathVariable String id) {

        boolean borrado = usuarioServicio.deleteUsuarioById(id);
        return ResponseEntity.ok().build(); // borrado exitoso
    }

    @Operation(summary = "Permite que un usuario se borre a si mismo SOFT DELETE")
    @DeleteMapping()
    public ResponseEntity<Void> eliminarElPropioUsuario(Authentication authentication) {

        Usuario usuarioActual = (Usuario) authentication.getPrincipal(); // lo que pusiste en el filtro
        String rol = authentication.getAuthorities().iterator().next().getAuthority(); // ej. ROLE_TUTOR

        boolean borrado = usuarioServicio.deleteUsuario(usuarioActual);
        return ResponseEntity.ok().build(); // borrado exitoso
    }

    @Operation(summary = "Obtener mi rol")
    @GetMapping("/getMyRole")
    public String getMyRole(Authentication authentication) {
        return authentication.getAuthorities().iterator().next().getAuthority(); // ej. ROLE_TUTOR
    }
}
