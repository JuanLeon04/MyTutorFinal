package uis.mytutor.controlador;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uis.mytutor.dto.SolicitudTutor;
import uis.mytutor.dto.TutorDTO;
import uis.mytutor.modelo.Tutor;
import uis.mytutor.modelo.Usuario;
import uis.mytutor.servicio.impl.TutorServicio;
import uis.mytutor.servicio.impl.UsuarioServicio;

import java.util.List;

@RestController
@RequestMapping("/api/tutor")
@Tag(name = "Tutor", description = "EndPoints sobre Tutores")
public class TutorControlador {

    @Autowired
    TutorServicio tutorServicio;

    @Autowired
    UsuarioServicio usuarioServicio;


    // -------------------------------------------------------------------------
    // 1. Listar todos los tutores (accesible para cualquiera)
    // -------------------------------------------------------------------------
    @Operation(summary = "Listar todos los tutores disponibles")
    @GetMapping("/list")
    public List<TutorDTO> listarTutores() {
        return tutorServicio.getTutores()
                .stream()
                .filter(t -> t != null)  // filtra usuarios que no son tutores
                .toList();
    }


    // -------------------------------------------------------------------------
    // 2. Obtener tutor por ID de usuario
    // -------------------------------------------------------------------------
    @Operation(summary = "Obtener información pública del tutor por ID")
    @GetMapping("/{idTutor}")
    public ResponseEntity<TutorDTO> obtenerTutorPorId(@PathVariable String idTutor) {
        TutorDTO dto = tutorServicio.getTutorPorId(idTutor);
        return ResponseEntity.ok(dto);
    }


    // -------------------------------------------------------------------------
    // 3. Obtener MI información de tutor (solo si soy tutor)
    // -------------------------------------------------------------------------
    @Operation(summary = "Obtener mi propia información como tutor")
    @PreAuthorize("hasRole('TUTOR')")
    @GetMapping()
    public ResponseEntity<SolicitudTutor> obtenerMiTutor(Authentication authentication) {

        Usuario usuarioActual = (Usuario) authentication.getPrincipal();

        SolicitudTutor dto = tutorServicio.getTutor(usuarioActual);
        return ResponseEntity.ok(dto);
    }


    // -------------------------------------------------------------------------
    // 4. Crear un tutor (convertir usuario en tutor)
    // -------------------------------------------------------------------------
    @Operation(summary = "Convertirse en tutor (crear perfil de tutor)")
    @PreAuthorize("hasRole('ESTUDIANTE')")
    @PostMapping("/crear")
    public ResponseEntity<Tutor> crearTutor(@RequestBody SolicitudTutor solicitud,
                                            Authentication authentication) {

        Usuario usuarioActual = (Usuario) authentication.getPrincipal();

        Tutor tutor = tutorServicio.crearTutor(solicitud, usuarioActual);
        return ResponseEntity.ok(tutor);
    }


    // -------------------------------------------------------------------------
    // 5. Actualizar mi perfil de tutor
    // -------------------------------------------------------------------------
    @Operation(summary = "Actualizar mi información de tutor")
    @PreAuthorize("hasRole('TUTOR')")
    @PutMapping()
    public ResponseEntity<SolicitudTutor> actualizarMiTutor(@RequestBody SolicitudTutor solicitud,
                                                            Authentication authentication) {

        Usuario usuarioActual = (Usuario) authentication.getPrincipal();

        SolicitudTutor actualizado = tutorServicio.ActualizarInfoTutorMismoUsuario(usuarioActual, solicitud);

        return ResponseEntity.ok(actualizado);
    }


    // -------------------------------------------------------------------------
    // 6. El tutor se desactiva a sí mismo (Soft Delete)
    // -------------------------------------------------------------------------
    @Operation(summary = "Desactivarme a mí mismo como tutor (soft delete)")
    @PreAuthorize("hasRole('TUTOR')")
    @DeleteMapping()
    public ResponseEntity<Void> desactivarMiTutor(Authentication authentication) {

        Usuario usuarioActual = (Usuario) authentication.getPrincipal();

        boolean borrado = tutorServicio.tutorSeDesactivaElMismo(usuarioActual);

        return ResponseEntity.ok().build();
    }


    // -------------------------------------------------------------------------
    // 7. Desactivar un tutor por un admin
    // -------------------------------------------------------------------------
    @Operation(summary = "Desactivar un tutor por ID (solo ADMIN)")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{idTutor}")
    public ResponseEntity<Void> desactivarTutorAdmin(@PathVariable String idTutor) {

        boolean borrado = tutorServicio.desactivarTutorPorId(idTutor);

            return ResponseEntity.ok().build();
    }
}

