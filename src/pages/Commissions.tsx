import React, { useState } from 'react';
import { Plus, Download, Users, Crown, Building2 } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Table } from '../components/UI/Table';
import { Modal, FormModal, ConfirmModal } from '../components/UI/Modal';
import { useCommissions } from '../hooks/useCommissions';
import { useMembres } from '../hooks/useMembres';
import { useExport } from '../hooks/useExport';
import { Commission, Membre, TableColumn } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function Commissions() {
  const {
    commissions,
    loading,
    createCommission,
    updateCommission,
    deleteCommission,
    addMembreToCommission,
    removeMembreFromCommission,
    setPresidentCommission
  } = useCommissions();

  const { membres } = useMembres();
  const { exportCommissionsExcel, exportCommissionsPdf } = useExport();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMembresModal, setShowMembresModal] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Colonnes du tableau
  const columns: TableColumn<Commission>[] = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      className: 'w-16'
    },
    {
      key: 'nom',
      label: 'Nom de la commission',
      sortable: true
    },
    {
      key: 'description',
      label: 'Description',
      render: (value) => value || '-'
    },
    {
      key: 'presidentMembreId',
      label: 'Président(e)',
      render: (value) => {
        if (!value) return '-';
        const president = membres.find(m => m.id === value);
        return president ? `${president.prenom} ${president.nom}` : '-';
      }
    },
    {
      key: 'membresIds',
      label: 'Membres',
      render: (value) => `${value.length} membre(s)`
    },
    {
      key: 'createdAt',
      label: 'Créée le',
      render: (value) => format(new Date(value), 'dd/MM/yyyy', { locale: fr })
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, commission) => (
        <div className="flex space-x-2">
          <Button
            size="xs"
            variant="ghost"
            onClick={() => handleViewMembres(commission)}
          >
            Membres
          </Button>
          <Button
            size="xs"
            variant="ghost"
            onClick={() => handleEdit(commission)}
          >
            Modifier
          </Button>
          <Button
            size="xs"
            variant="danger"
            onClick={() => handleDelete(commission)}
          >
            Supprimer
          </Button>
        </div>
      )
    }
  ];

  // Statistiques
  const stats = {
    total: commissions.length,
    avecPresident: commissions.filter(c => c.presidentMembreId).length,
    totalMembres: commissions.reduce((acc, c) => acc + c.membresIds.length, 0)
  };

  // Gestionnaires d'événements
  const handleCreate = () => {
    setFormData({ nom: '', description: '' });
    setFormErrors({});
    setShowCreateModal(true);
  };

  const handleEdit = (commission: Commission) => {
    setSelectedCommission(commission);
    setFormData({
      nom: commission.nom,
      description: commission.description || ''
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleDelete = (commission: Commission) => {
    setSelectedCommission(commission);
    setShowDeleteModal(true);
  };

  const handleViewMembres = (commission: Commission) => {
    setSelectedCommission(commission);
    setShowMembresModal(true);
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const result = await createCommission({
      nom: formData.nom.trim(),
      description: formData.description.trim() || undefined,
      membresIds: []
    });

    if (result.success) {
      setShowCreateModal(false);
    } else if (result.errors) {
      setFormErrors(result.errors);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommission) return;

    setFormErrors({});

    const result = await updateCommission(selectedCommission.id, {
      nom: formData.nom.trim(),
      description: formData.description.trim() || undefined
    });

    if (result.success) {
      setShowEditModal(false);
      setSelectedCommission(null);
    } else if (result.errors) {
      setFormErrors(result.errors);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCommission) return;

    const result = await deleteCommission(selectedCommission.id);
    if (result.success) {
      setShowDeleteModal(false);
      setSelectedCommission(null);
    }
  };

  const handleAddMembre = async (membreId: number) => {
    if (!selectedCommission) return;
    await addMembreToCommission(selectedCommission.id, membreId);
  };

  const handleRemoveMembre = async (membreId: number) => {
    if (!selectedCommission) return;
    await removeMembreFromCommission(selectedCommission.id, membreId);
  };

  const handleSetPresident = async (membreId: number) => {
    if (!selectedCommission) return;
    await setPresidentCommission(selectedCommission.id, membreId);
  };

  const handleExportExcel = () => {
    exportCommissionsExcel();
  };

  const handleExportPdf = () => {
    exportCommissionsPdf();
  };

  // Membres de la commission sélectionnée
  const membresCommission = selectedCommission 
    ? membres.filter(m => selectedCommission.membresIds.includes(m.id))
    : [];

  // Membres disponibles (non dans la commission)
  const membresDisponibles = selectedCommission
    ? membres.filter(m => !selectedCommission.membresIds.includes(m.id) && m.actif)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des commissions</h1>
          <p className="text-gray-600 mt-1">
            Organisez les commissions et leurs membres
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
            variant="secondary"
            icon={<Download />}
            onClick={handleExportPdf}
          >
            Export PDF
          </Button>
          <Button
            variant="primary"
            icon={<Plus />}
            onClick={handleCreate}
          >
            Nouvelle commission
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <Building2 className="w-8 h-8 text-primary" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total commissions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <Crown className="w-8 h-8 text-primary" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avec président</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avecPresident}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-greenaj" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total membres</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMembres}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des commissions */}
      <div className="bg-white rounded-lg shadow-sm border">
        <Table
          data={commissions}
          columns={columns}
          loading={loading}
          emptyMessage="Aucune commission créée"
        />
      </div>

      {/* Modal de création */}
      <FormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nouvelle commission"
        onSubmit={handleSubmitCreate}
        loading={loading}
      >
        <Input
          label="Nom de la commission"
          value={formData.nom}
          onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
          error={formErrors.nom}
          required
          placeholder="Ex: Commission Sociale, Culturelle et Sportive"
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Description des activités et responsabilités..."
          />
          {formErrors.description && (
            <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
          )}
        </div>
      </FormModal>

      {/* Modal de modification */}
      <FormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCommission(null);
        }}
        title="Modifier la commission"
        onSubmit={handleSubmitEdit}
        loading={loading}
      >
        <Input
          label="Nom de la commission"
          value={formData.nom}
          onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
          error={formErrors.nom}
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Description des activités et responsabilités..."
          />
        </div>
      </FormModal>

      {/* Modal de suppression */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCommission(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Supprimer la commission"
        message={`Êtes-vous sûr de vouloir supprimer la commission "${selectedCommission?.nom}" ? Tous les membres seront détachés de cette commission.`}
        confirmText="Supprimer"
        variant="danger"
        loading={loading}
      />

      {/* Modal de gestion des membres */}
      <Modal
        isOpen={showMembresModal}
        onClose={() => {
          setShowMembresModal(false);
          setSelectedCommission(null);
        }}
        title={`Membres de la commission "${selectedCommission?.nom}"`}
        size="lg"
      >
        <div className="space-y-6">
          {/* Membres actuels */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Membres actuels ({membresCommission.length})
            </h3>
            {membresCommission.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Aucun membre dans cette commission
              </p>
            ) : (
              <div className="space-y-2">
                {membresCommission.map((membre) => (
                  <div
                    key={membre.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {membre.prenom} {membre.nom}
                        </p>
                        {membre.telephone && (
                          <p className="text-sm text-gray-500">{membre.telephone}</p>
                        )}
                      </div>
                      {selectedCommission?.presidentMembreId === membre.id && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary text-white">
                          <Crown className="w-3 h-3 mr-1" />
                          Président(e)
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {selectedCommission?.presidentMembreId !== membre.id && (
                        <Button
                          size="xs"
                          variant="secondary"
                          onClick={() => handleSetPresident(membre.id)}
                        >
                          Nommer président(e)
                        </Button>
                      )}
                      <Button
                        size="xs"
                        variant="danger"
                        onClick={() => handleRemoveMembre(membre.id)}
                      >
                        Retirer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Membres disponibles */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Ajouter des membres ({membresDisponibles.length} disponibles)
            </h3>
            {membresDisponibles.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Tous les membres actifs sont déjà dans cette commission
              </p>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {membresDisponibles.map((membre) => (
                  <div
                    key={membre.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {membre.prenom} {membre.nom}
                      </p>
                      {membre.telephone && (
                        <p className="text-sm text-gray-500">{membre.telephone}</p>
                      )}
                    </div>
                    <Button
                      size="xs"
                      variant="primary"
                      onClick={() => handleAddMembre(membre.id)}
                    >
                      Ajouter
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
