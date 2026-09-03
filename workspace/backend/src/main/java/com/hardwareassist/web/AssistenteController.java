package com.hardwareassist.web;

import com.hardwareassist.dto.CatalogoResponse;
import com.hardwareassist.dto.ProdutoDTO;
import com.hardwareassist.dto.RecomendacaoRequest;
import com.hardwareassist.dto.RecomendacaoResponse;
import com.hardwareassist.dto.SubstituicaoRequest;
import com.hardwareassist.service.CatalogoService;
import com.hardwareassist.service.MontagemService;
import com.hardwareassist.service.RecomendacaoImpossivelException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AssistenteController {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AssistenteController.class);

    private final CatalogoService catalogoService;
    private final MontagemService montagemService;

    public AssistenteController(CatalogoService catalogoService, MontagemService montagemService) {
        this.catalogoService = catalogoService;
        this.montagemService = montagemService;
    }

    @GetMapping("/catalogo")
    public CatalogoResponse catalogo() {
        return catalogoService.obterCatalogo();
    }

    @PostMapping("/recomendacoes")
    public RecomendacaoResponse recomendar(@Valid @RequestBody RecomendacaoRequest request) {
        return montagemService.recomendar(request);
    }

    @PostMapping("/receitas/recomendadas")
    public List<RecomendacaoResponse> receitasRecomendadas(
            @Valid @RequestBody RecomendacaoRequest request) {
        return montagemService.recomendarPorMarca(request);
    }

    @PostMapping("/montagens/substitutas")
    public Map<String, List<ProdutoDTO>> substitutos(@Valid @RequestBody SubstituicaoRequest request) {
        Map<String, List<ProdutoDTO>> corpo = new LinkedHashMap<>();
        corpo.put("substitutos", montagemService.substitutos(request.produtoId(), request.montagemIds()));
        return corpo;
    }

    @ExceptionHandler(RecomendacaoImpossivelException.class)
    public ResponseEntity<Map<String, String>> tratarImpossivel(RecomendacaoImpossivelException ex) {
        Map<String, String> corpo = new LinkedHashMap<>();
        corpo.put("mensagem", ex.getMessage());
        return ResponseEntity.badRequest().body(corpo);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> tratarValidacao(MethodArgumentNotValidException ex) {
        Map<String, String> corpo = new LinkedHashMap<>();
        String mensagem = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(f -> f.getField() + ": " + f.getDefaultMessage())
                .orElse("Requisicao invalida.");
        corpo.put("mensagem", mensagem);
        return ResponseEntity.badRequest().body(corpo);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> tratarErroGenerico(Exception ex) {
        log.error("Erro nao tratado", ex);
        Map<String, String> corpo = new LinkedHashMap<>();
        corpo.put("mensagem", "Erro interno no servidor.");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(corpo);
    }
}
