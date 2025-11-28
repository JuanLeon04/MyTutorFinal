package uis.mytutor.controlador;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uis.mytutor.modelo.Horario;
import uis.mytutor.modelo.Reserva;
import uis.mytutor.modelo.Usuario;
import uis.mytutor.servicio.impl.ReservaServicio;

import java.util.List;

@RestController
@RequestMapping("/api/reserva")
@Tag(name = "Reserva", description = "EndPoints sobre Reservas")
public class ReservaControlador {

    @Autowired
    ReservaServicio reservaServicio;


    // -------------------------------------------------------------------------
    // 1. Listar todas las reservas (accesible para ADMIN o TUTOR)
    // -------------------------------------------------------------------------
    @Operation(summary = "Listar todas las reservas del sistema")
    @PreAuthorize("hasAnyRole('ADMIN', 'TUTOR')")
    @GetMapping("/list")
    public ResponseEntity<List<Horario>> listarTodasLasReservas() {
        List<Horario> reservas = reservaServicio.getReservas();
        return ResponseEntity.ok(reservas);
    }


    // -------------------------------------------------------------------------
    // 2. Obtener mis reservas (estudiante o tutor)
    // -------------------------------------------------------------------------
    @Operation(summary = "Obtener mis propias reservas")
    @PreAuthorize("hasAnyRole('ESTUDIANTE', 'TUTOR')")
    @GetMapping()
    public ResponseEntity<List<Horario>> obtenerMisReservas(Authentication authentication) {
        Usuario usuarioActual = (Usuario) authentication.getPrincipal();

        List<Horario> misReservas = reservaServicio.ObtenerMisReservas(usuarioActual);
        return ResponseEntity.ok(misReservas);
    }


    // -------------------------------------------------------------------------
    // 3. Reservar un horario
    // -------------------------------------------------------------------------
    @Operation(summary = "Reservar un horario de tutoría")
    @PreAuthorize("hasAnyRole('ESTUDIANTE', 'TUTOR')")
    @PostMapping("/{idHorario}")
    public ResponseEntity<Reserva> reservarHorario(@PathVariable String idHorario,
                                                   Authentication authentication) {
        Usuario usuarioActual = (Usuario) authentication.getPrincipal();

        Reserva nuevaReserva = reservaServicio.reservarHorario(usuarioActual, idHorario);
        return ResponseEntity.ok(nuevaReserva);
    }


    // -------------------------------------------------------------------------
    // 4. Cancelar una reserva
    // -------------------------------------------------------------------------
    @Operation(summary = "Cancelar una reserva que hizo un usuario (Solo 1 día antes y rol tutor)")
    @PreAuthorize("hasAnyRole('ESTUDIANTE', 'TUTOR')")
    @DeleteMapping("/{idHorario}")
    public ResponseEntity<Reserva> cancelarReserva(@PathVariable String idHorario,
                                                   Authentication authentication) {
        Usuario usuarioActual = (Usuario) authentication.getPrincipal();

        Reserva reservaCancelada = reservaServicio.cancelarReserva(usuarioActual, idHorario);
        return ResponseEntity.ok(reservaCancelada);

    }


    // -------------------------------------------------------------------------
    // 4.1 Tutor cancela una reserva que un estudiante le hizo
    // -------------------------------------------------------------------------
    @Operation(summary = "Que un Tutor cancele una reserva que le hicieron (Solo 1 día antes)")
    @PreAuthorize("hasAnyRole('TUTOR')")
    @DeleteMapping("/tutor/{idHorario}")
    public ResponseEntity<Reserva> turorCancelaReserva(@PathVariable String idHorario,
                                                   Authentication authentication) {
        Usuario usuarioActual = (Usuario) authentication.getPrincipal();

        Reserva reservaCancelada = reservaServicio.tutorCancelaReservaHecha(usuarioActual, idHorario);
        return ResponseEntity.ok(reservaCancelada);
    }


    // -------------------------------------------------------------------------
    // 5. Marcar reserva como completada (solo TUTOR)
    // -------------------------------------------------------------------------
    @Operation(summary = "Marcar una reserva como completada (solo tutor)")
    @PreAuthorize("hasRole('TUTOR')")
    @PutMapping("/{idHorario}/completada")
    public ResponseEntity<Reserva> marcarReservaCompletada(@PathVariable String idHorario,
                                                           Authentication authentication) {
        Usuario usuarioActual = (Usuario) authentication.getPrincipal();

        Reserva reservaCompletada = reservaServicio.reservaCompletada(usuarioActual, idHorario);
        return ResponseEntity.ok(reservaCompletada);

    }


    // -------------------------------------------------------------------------
    // 6. Marcar que el estudiante no asistió (solo TUTOR)
    // -------------------------------------------------------------------------
    @Operation(summary = "Marcar que el estudiante no asistió a la reserva (solo tutor)")
    @PreAuthorize("hasRole('TUTOR')")
    @PutMapping("/{idHorario}/no-asistio")
    public ResponseEntity<Reserva> marcarNoAsistio(@PathVariable String idHorario,
                                                   Authentication authentication) {
        Usuario usuarioActual = (Usuario) authentication.getPrincipal();

        Reserva reservaNoAsistio = reservaServicio.noAsistioALaReserva(usuarioActual, idHorario);
        return ResponseEntity.ok(reservaNoAsistio);
    }
}