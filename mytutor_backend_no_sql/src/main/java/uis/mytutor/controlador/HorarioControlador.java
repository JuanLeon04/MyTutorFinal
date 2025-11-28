package uis.mytutor.controlador;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uis.mytutor.dto.HorarioDisponibleDTO;
import uis.mytutor.dto.SolicitudHorario;
import uis.mytutor.modelo.Horario;
import uis.mytutor.modelo.Usuario;
import uis.mytutor.servicio.impl.HorarioServicio;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/horario")
@Tag(name = "Horario", description = "EndPoints sobre los Horarios")
public class HorarioControlador {

    @Autowired
    HorarioServicio horarioServicio;


    // -------------------------------------------------------------------------
    // 1. Obtener TODOS los horarios (disponibles y no disponibles)
    // -------------------------------------------------------------------------
    @Operation(summary = "Obtener todos los horarios registrados (solo admin)")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/list")
    public List<Horario> obtenerTodosLosHorarios() {
        return horarioServicio.obtenerTodosLosHorarios();
    }


    // -------------------------------------------------------------------------
    // 1.1 Obtener TODOS los horarios de un tutor (disponibles y no disponibles)
    // -------------------------------------------------------------------------
    @Operation(summary = "Que un tutor obtenga todos sus horarios (Solo tutor)")
    @PreAuthorize("hasRole('TUTOR')")
    @GetMapping("/listMyHorarios")
    public List<Horario> obtenerTodosLosHorariosDeTutor(Authentication authentication) {
        Usuario usuarioActual = (Usuario) authentication.getPrincipal();
        return horarioServicio.obtenerHorariosTutor(usuarioActual);
    }


    // -------------------------------------------------------------------------
    // 2. Obtener solo horarios disponibles
    // -------------------------------------------------------------------------
    @Operation(summary = "Obtener todos los horarios DISPONIBLES")
    @GetMapping("/disponibles")
    public List<HorarioDisponibleDTO> obtenerHorariosDisponibles() {
        return horarioServicio.obtenerTodosLosHorariosDisponibles();
    }


    // -------------------------------------------------------------------------
    // 3. Obtener horarios filtrados
    // -------------------------------------------------------------------------
    // http://localhost:8081/api/horario/filtrar?materia=Matem%C3%A1ticas&precioMin=20&precioMax=50&calificacionMin=4&fechaInicio=2025-11-20T10:00:00&fechaFin=2025-11-25T18:00:00
    @Operation(summary = "Obtener horarios disponibles filtrados")
    @GetMapping("/filtrar")
    public List<HorarioDisponibleDTO> obtenerHorariosFiltrados(
            @Parameter(description = "Nombre de la materia a filtrar", example = "Matemáticas")
            @RequestParam(required = false) String materia,

            @Parameter(description = "Precio mínimo", example = "20.0")
            @RequestParam(required = false) Double precioMin,

            @Parameter(description = "Precio máximo", example = "50.0")
            @RequestParam(required = false) Double precioMax,

            @Parameter(description = "Calificación mínima", example = "4.0")
            @RequestParam(required = false) Double calificacionMin,

            @Parameter(description = "Calificación máxima", example = "5.0")
            @RequestParam(required = false) Double calificacionMax,

            @Parameter(description = "Nombre del tutor", example = "Juan Pérez")
            @RequestParam(required = false) String nombreTutor,

            @Parameter(description = "Fecha de inicio en formato ISO", example = "2025-11-17T23:25:00.000Z")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime fechaInicio,

            @Parameter(description = "Fecha de fin en formato ISO", example = "2025-11-17T23:25:00.000Z")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime fechaFin
    ) {
        return horarioServicio.obtenerHorariosFiltrados(
                materia, precioMin, precioMax,
                calificacionMin, calificacionMax,
                nombreTutor, fechaInicio, fechaFin
        );
    }


    // -------------------------------------------------------------------------
    // 4. Crear horario (solo TUTOR)
    // -------------------------------------------------------------------------
    @Operation(summary = "Crear un horario de tutoría (solo tutor)")
    @PreAuthorize("hasRole('TUTOR')")
    @PostMapping("/crear")
    public ResponseEntity<Horario> crearHorario(Authentication authentication,
                                          @RequestBody SolicitudHorario solicitud) {

        Usuario usuarioActual = (Usuario) authentication.getPrincipal();

        Horario nuevo = horarioServicio.crearHorarioTutoria(usuarioActual, solicitud);
        return ResponseEntity.ok(nuevo);
    }


    // -------------------------------------------------------------------------
    // 5. Modificar un horario existente (solo tutor)
    // -------------------------------------------------------------------------
    @Operation(summary = "Modificar un horario propio por su ID (solo tutor)")
    @PreAuthorize("hasRole('TUTOR')")
    @PutMapping("/{idHorario}")
    public ResponseEntity<Horario> modificarHorario(
            @PathVariable String idHorario,
            @RequestBody SolicitudHorario solicitud,
            Authentication authentication) {

        Usuario usuarioActual = (Usuario) authentication.getPrincipal();

        Horario actualizado = horarioServicio.modificarHorarioTutoria(
                    usuarioActual, idHorario, solicitud
            );
        return ResponseEntity.ok(actualizado);

    }


    // -------------------------------------------------------------------------
    // 6. Tutor desactiva (soft delete) su propio horario
    // -------------------------------------------------------------------------
    @Operation(summary = "Desactivar un horario propio (soft delete) - solo tutor")
    @PreAuthorize("hasRole('TUTOR')")
    @DeleteMapping("/{idHorario}")
    public ResponseEntity<Boolean> desactivarHorario(
            @PathVariable String idHorario,
            Authentication authentication) {

        Usuario usuarioActual = (Usuario) authentication.getPrincipal();

        boolean ok = horarioServicio.desactivarHorarioTutoria(usuarioActual, idHorario);

        if (!ok) return ResponseEntity.notFound().build();
        return ResponseEntity.ok().build();
    }

}
