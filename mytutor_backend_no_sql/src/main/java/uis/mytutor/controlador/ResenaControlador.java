package uis.mytutor.controlador;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uis.mytutor.dto.ModificarResena;
import uis.mytutor.dto.ResenasDTO;
import uis.mytutor.dto.SolicitudResena;
import uis.mytutor.modelo.Resena;
import uis.mytutor.modelo.Usuario;
import uis.mytutor.servicio.impl.ResenaServicio;

import java.util.List;

@RestController
@RequestMapping("/api/resena")
@Tag(name = "Reseña", description = "EndPoints sobre las Reseñas")
public class ResenaControlador {

    @Autowired
    ResenaServicio resenaServicio;


    // -------------------------------------------------------------------------
    // 1. Obtener reseñas de un tutor por su ID (público)
    // -------------------------------------------------------------------------
    @Operation(summary = "Obtener todas las reseñas de un tutor específico")
    @GetMapping("/tutor/{idTutor}")
    public ResponseEntity<List<Resena>> obtenerResenasDeTutor(@PathVariable String idTutor) {
        List<Resena> resenas = resenaServicio.getResenasDeTutorPorId(idTutor);
        return ResponseEntity.ok(resenas);
    }


    // -------------------------------------------------------------------------
    // 2. Obtener las reseñas que YO he hecho
    // -------------------------------------------------------------------------
    @Operation(summary = "Obtener las reseñas que he realizado")
    @PreAuthorize("hasAnyRole('ESTUDIANTE', 'TUTOR')")
    @GetMapping()
    public ResponseEntity<List<ResenasDTO>> obtenerMisResenas(Authentication authentication) {
        Usuario usuarioActual = (Usuario) authentication.getPrincipal();

        List<ResenasDTO> misResenas = resenaServicio.obtenerResenasHechas(usuarioActual);
        return ResponseEntity.ok(misResenas);
    }


    // -------------------------------------------------------------------------
    // 4. Obtener reseña por id
    // -------------------------------------------------------------------------
    @Operation(summary = "Obtener una reseña por id realizado")
    @PreAuthorize("hasAnyRole('ESTUDIANTE', 'TUTOR', 'ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<ResenasDTO> obtenerResenaPorId(@PathVariable String id) {
        ResenasDTO dto = resenaServicio.obtenerResenaPorId(id);
        return ResponseEntity.ok(dto);
    }


    // -------------------------------------------------------------------------
    // 4. Crear una reseña para un tutor
    // -------------------------------------------------------------------------
    @Operation(summary = "Crear una reseña para un tutor después de una tutoría completada")
    @PreAuthorize("hasAnyRole('ESTUDIANTE', 'TUTOR')")
    @PostMapping()
    public ResponseEntity<Resena> crearResena(@RequestBody SolicitudResena solicitud,
                                              Authentication authentication) {
        Usuario usuarioActual = (Usuario) authentication.getPrincipal();

        Resena nuevaResena = resenaServicio.crearResena(usuarioActual, solicitud);
        return ResponseEntity.ok(nuevaResena);
    }


    // -------------------------------------------------------------------------
    // 4. Modificar reseña
    // -------------------------------------------------------------------------
    @Operation(summary = "Modificar una reseña hecha")
    @PreAuthorize("hasAnyRole('ESTUDIANTE', 'TUTOR')")
    @PutMapping()
    public ResponseEntity<ResenasDTO> modificarResena(ModificarResena modificarResena, Authentication authentication) {
        Usuario usuarioActual = (Usuario) authentication.getPrincipal();

        return ResponseEntity.ok(resenaServicio.modificarResena(usuarioActual, modificarResena));
    }
}