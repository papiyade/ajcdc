import React, { useState } from 'react';
import { Plus, Download, FileText, Calendar, MapPin, Copy } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Table } from '../components/UI/Table';
import { Modal, FormModal, ConfirmModal } from '../components/UI/Modal';
import { usePV } from '../hooks/usePV';
import { useExport } from '../hooks/useExport';
import { PV, TableColumn } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function PV() {
  const {
    pvs,
    loading,
    createPV,
    updatePV,
    deletePV,
    duplicatePV
  } = usePV();

  const { exportPVExcel, exportPVPdf } = useExport();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPV, setSelectedPV] = useState<PV | null>(null);
  const [formData, setFormData] = useState({
    titre: '',
    date: '',
    lieu: '',
    texte: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Templates prédéfinis
  const templates = [
    {
      name: 'Assemblée Générale',
      titre: 'Assemblée Générale du [DATE]',
      texte: `ORDRE DU JOUR :

1. Ouverture de la séance
2. Approbation du procès-verbal de la dernière AG
3. Rapport d'activités
4. Rapport financier
5. Questions diverses
6. Clôture de la séance

DÉROULEMENT :

[Détailler ici le déroulement de la réunion...]

DÉCISIONS PRISES :

[Lister les décisions importantes...]

PROCHAINES ACTIONS :

[Actions à entreprendre...]`
    },
    {
      name: 'Réunion Bureau',
      titre: 'Réunion du Bureau du [DATE]',
      texte: `PARTICIPANTS :
- [Nom des participants]

POINTS ABORDÉS :

1. [Point 1]
2. [Point 2]
3. [Point 3]

DÉCISIONS :

[Décisions prises...]

ACTIONS À SUIVRE :

[Actions et responsables...]`
    },
    {
      name: 'Réunion Commission',
      titre: 'Réunion Commission [NOM] du [DATE]',
      texte: `COMMISSION : [Nom de la commission]
PRÉSIDENT(E) : [Nom du/de la président(e)]

PARTICIPANTS :
[Liste des participants]

ACTIVITÉS PLANIFIÉES :

1. [Activité 1]
2. [Activité 2]
3. [Activité 3]

BUDGET NÉCESSAIRE :
[Détails du budget]

ÉCHÉANCES :
[Dates importantes]`
    }
  ];

  // Colonnes du tableau
  const columns: TableColumn<PV>[] = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      className: 'w-16'
    },
    {
      key: 'titre',
      label: 'Titre',
      sortable: true
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (value) => format(new Date(value), 'dd/MM/yyyy', { locale: fr })
    },
    {
      key: 'lieu',
      label: 'Lieu',
      render: (value) => value || '-'
    },
    {
      key: 'texte',
      label: 'Contenu',
      render: (value) => {
        const preview = value.substring(0, 100);
        return preview.length < value.length ? `${preview}...` : preview;
      }
    },
    {
      key: 'createdAt',
      label: 'Créé le',
      render: (value) => format(new Date(value), 'dd/MM/yyyy', { locale: fr })
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, pv) => (
        <div className="flex space-x-2">
          <Button
            size="xs"
            variant="ghost"
            onClick={() => handleView(pv)}
          >
            Voir
          </Button>
          <Button
            size="xs"
            variant="ghost"
            onClick={() => handleEdit(pv)}
          >
            Modifier
          </Button>
          <Button
            size="xs"
            variant="secondary"
            onClick={() => handleDuplicate(pv)}
          >
            Dupliquer
          </Button>
          <Button
            size="xs"
            variant="danger"
            onClick={() => handleDelete(pv)}
          >
            Supprimer
          </Button>
        </div>
      )
    }
  ];

  // Statistiques
  const stats = {
    total: pvs.length,
    cetteAnnee: pvs.filter(pv => 
      new Date(pv.date).getFullYear() === new Date().getFullYear()
    ).length,
    ceMois: pvs.filter(pv => {
      const pvDate = new Date(pv.date);
      const now = new Date();
      return pvDate.getMonth() === now.getMonth() && 
             pvDate.getFullYear() === now.getFullYear();
    }).length
  };

  // Gestionnaires d'événements
  const handleCreate = () => {
    setFormData({
      titre: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      lieu: '',
      texte: ''
    });
    setFormErrors({});
    setShowCreateModal(true);
  };

  const handleEdit = (pv: PV) => {
    setSelectedPV(pv);
    setFormData({
      titre: pv.titre,
      date: format(new Date(pv.date), 'yyyy-MM-dd'),
      lieu: pv.lieu || '',
      texte: pv.texte
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleView = (pv: PV) => {
    setSelectedPV(pv);
    setShowViewModal(true);
  };

  const handleDelete = (pv: PV) => {
    setSelectedPV(pv);
    setShowDeleteModal(true);
  };

  const handleDuplicate = async (pv: PV) => {
    const result = await duplicatePV(pv.id);
    if (result.success && result.data) {
      // Ouvrir directement en édition le PV dupliqué
      handleEdit(result.data);
    }
  };

  const handleUseTemplate = (template: typeof templates[0]) => {
    const today = format(new Date(), 'dd MMMM yyyy', { locale: fr });
    setFormData({
      ...formData,
      titre: template.titre.replace('[DATE]', today),
      texte: template.texte
    });
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const result = await createPV({
      titre: formData.titre.trim(),
      date: formData.date,
      lieu: formData.lieu.trim() || undefined,
      texte: formData.texte.trim()
    });

    if (result.success) {
      setShowCreateModal(false);
    } else if (result.errors) {
      setFormErrors(result.errors);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPV) return;

    setFormErrors({});

    const result = await updatePV(selectedPV.id, {
      titre: formData.titre.trim(),
      date: formData.date,
      lieu: formData.lieu.trim() || undefined,
      texte: formData.texte.trim()
    });

    if (result.success) {
      setShowEditModal(false);
      setSelectedPV(null);
    } else if (result.errors) {
      setFormErrors(result.errors);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedPV) return;

    const result = await deletePV(selectedPV.id);
    if (result.success) {
      setShowDeleteModal(false);
      setSelectedPV(null);
    }
  };

  const handleExportExcel = () => {
    exportPVExcel();
  };

  const handleExportPdf = (pv?: PV) => {
    if (pv) {
      exportPVPdf(pv.id);
    } else {
      exportPVExcel(); // Export de tous les PV en Excel
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Procès-verbaux</h1>
          <p className="text-gray-600 mt-1">
            Gérez les procès-verbaux des réunions AJCDC
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button
            variant="secondary"
            icon={<Download />}
            onClick={handleExportExcel}
          >
            Export Excel
          </Button>
          <Button
            variant="primary"
            icon={<Plus />}
            onClick={handleCreate}
          >
            Nouveau PV
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-primary" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total PV</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-greenaj" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cette année</p>
              <p className="text-2xl font-bold text-gray-900">{stats.cetteAnnee}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-bicblue" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ce mois</p>
              <p className="text-2xl font-bold text-gray-900">{stats.ceMois}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des PV */}
      <div className="bg-white rounded-lg shadow-sm border">
        <Table
          data={pvs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
          columns={columns}
          loading={loading}
          emptyMessage="Aucun procès-verbal enregistré"
        />
      </div>

      {/* Modal de création */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nouveau procès-verbal"
        size="xl"
      >
        <form onSubmit={handleSubmitCreate} className="space-y-6">
          {/* Templates */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Utiliser un template
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {templates.map((template) => (
                <Button
                  key={template.name}
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleUseTemplate(template)}
                  className="text-left"
                >
                  {template.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Titre"
              value={formData.titre}
              onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
              error={formErrors.titre}
              required
              placeholder="Ex: Assemblée Générale du 15 mars 2024"
            />
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              error={formErrors.date}
              required
            />
          </div>

          <Input
            label="Lieu"
            value={formData.lieu}
            onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
            error={formErrors.lieu}
            placeholder="Ex: Siège de l'association, Bambilor"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contenu du procès-verbal *
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={12}
              value={formData.texte}
              onChange={(e) => setFormData({ ...formData, texte: e.target.value })}
              placeholder="Rédigez le contenu du procès-verbal..."
              required
            />
            {formErrors.texte && (
              <p className="mt-1 text-sm text-red-600">{formErrors.texte}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
            >
              Créer le PV
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de modification */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedPV(null);
        }}
        title="Modifier le procès-verbal"
        size="xl"
      >
        <form onSubmit={handleSubmitEdit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Titre"
              value={formData.titre}
              onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
              error={formErrors.titre}
              required
            />
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              error={formErrors.date}
              required
            />
          </div>

          <Input
            label="Lieu"
            value={formData.lieu}
            onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
            error={formErrors.lieu}
            placeholder="Ex: Siège de l'association, Bambilor"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contenu du procès-verbal *
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={12}
              value={formData.texte}
              onChange={(e) => setFormData({ ...formData, texte: e.target.value })}
              required
            />
            {formErrors.texte && (
              <p className="mt-1 text-sm text-red-600">{formErrors.texte}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowEditModal(false);
                setSelectedPV(null);
              }}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
            >
              Enregistrer
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de visualisation */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedPV(null);
        }}
        title={selectedPV?.titre || ''}
        size="xl"
      >
        {selectedPV && (
          <div className="space-y-6">
            {/* Informations */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {format(new Date(selectedPV.date), 'dd MMMM yyyy', { locale: fr })}
                  </span>
                </div>
                {selectedPV.lieu && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{selectedPV.lieu}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contenu */}
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-900">
                {selectedPV.texte}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="secondary"
                icon={<Copy />}
                onClick={() => handleDuplicate(selectedPV)}
              >
                Dupliquer
              </Button>
              <Button
                variant="secondary"
                icon={<Download />}
                onClick={() => handleExportPdf(selectedPV)}
              >
                Export PDF
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setShowViewModal(false);
                  handleEdit(selectedPV);
                }}
              >
                Modifier
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de suppression */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedPV(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Supprimer le procès-verbal"
        message={`Êtes-vous sûr de vouloir supprimer le PV "${selectedPV?.titre}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="danger"
        loading={loading}
      />
    </div>
  );
}
